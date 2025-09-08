<?php

namespace App\Http\Controllers\kepala_desa;

use App\Http\Controllers\Controller;
use App\Models\{BalanceHistory, Expense, Income, InitialBalance, RentTransaction, Unit};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Cache, DB};
use Inertia\Inertia;
use App\Models\Tarif;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DetailLaporanExport;
use Illuminate\Support\Facades\Log;

class AirWeslikController extends Controller
{
    use AuthorizesRequests;
    private const UNIT_ID = 4;
    private const CACHE_TTL = 3600;
    private const DEFAULT_PER_PAGE = 10;

    public function index(Request $request)
    {
        $unitId = self::UNIT_ID;
        $unit = Unit::findOrFail($unitId);
        $histories = $this->getRingkasanLaporanBulanan($unitId);
        $tarif = $this->getCurrentTarif($unitId);
        $allTarifs = $this->getAllTarifs($unitId); // Tambahan untuk semua data tarif
        $currentMonthSummary = $this->getCurrentMonthSummary($unitId);

        $page = (int) $request->get('page', 1);
        $perPage = self::DEFAULT_PER_PAGE;
        $paged = $histories->forPage($page, $perPage)->values();

        return Inertia::render('kepala_bumdes/Airweslik', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'roles', 'image']),
            ],
            'laporanKeuangan' => $paged,
            'initial_balance' => $this->getInitialBalance($unitId),
            'tanggal_diubah' => $this->getInitialBalanceTanggal($unitId),
            'currentMonthSummary' => $currentMonthSummary,
            'tarif' => $tarif,
            'allTarifs' => $allTarifs, // Data semua tarif untuk modal
            'unit' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type,
            ],
            'pagination' => [
                'total' => $histories->count(),
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($histories->count() / $perPage),
            ]
        ]);
    }

    public function downloadPdfDetail($bulan)
    {
        try {
            // PERBAIKAN 1: Enhanced logging dan error tracking
            Log::info('PDF Download Request Started', [
                'bulan_param' => $bulan,
                'user_id' => Auth::id(),
                'timestamp' => now(),
                'memory_usage' => memory_get_usage(true),
                'memory_limit' => ini_get('memory_limit')
            ]);

            $unitId = self::UNIT_ID;

            // PERBAIKAN 2: Set optimal environment untuk PDF generation
            ini_set('memory_limit', '1G'); // Increase memory limit
            ini_set('max_execution_time', 300); // 5 minutes
            set_time_limit(300);

            // PERBAIKAN 3: Robust month parameter parsing
            $year = null;
            $month = null;
            $bulan = urldecode($bulan); // Handle URL encoding

            // Try different formats
            if (preg_match('/^(\d{4})-(\d{2})$/', $bulan, $matches)) {
                // Format: YYYY-MM
                $year = (int)$matches[1];
                $month = $matches[2];
            } elseif (preg_match('/^(\d{4})(\d{2})$/', $bulan, $matches)) {
                // Format: YYYYMM
                $year = (int)$matches[1];
                $month = $matches[2];
            } elseif (strpos($bulan, ' ') !== false) {
                // Format: "Month YYYY"
                $parts = explode(' ', $bulan);
                if (count($parts) >= 2) {
                    $monthName = $parts[0];
                    $year = (int)end($parts);

                    $monthMapping = [
                        'January' => '01',
                        'February' => '02',
                        'March' => '03',
                        'April' => '04',
                        'May' => '05',
                        'June' => '06',
                        'July' => '07',
                        'August' => '08',
                        'September' => '09',
                        'October' => '10',
                        'November' => '11',
                        'December' => '12',
                        'Januari' => '01',
                        'Februari' => '02',
                        'Maret' => '03',
                        'April' => '04',
                        'Mei' => '05',
                        'Juni' => '06',
                        'Juli' => '07',
                        'Agustus' => '08',
                        'September' => '09',
                        'Oktober' => '10',
                        'November' => '11',
                        'Desember' => '12'
                    ];

                    $month = $monthMapping[$monthName] ?? null;
                }
            }

            // PERBAIKAN 4: Enhanced validation
            if (!$year || !$month) {
                Log::error('Failed to parse month parameter', [
                    'original' => $bulan,
                    'parsed_year' => $year,
                    'parsed_month' => $month
                ]);
                return response()->json([
                    'error' => 'Format bulan tidak valid. Gunakan format YYYY-MM atau "Month YYYY"',
                    'received' => $bulan,
                    'expected_formats' => ['YYYY-MM', 'Month YYYY']
                ], 400);
            }

            // Additional validations
            $currentYear = (int)date('Y');
            if ($year < 2020 || $year > $currentYear + 1) {
                return response()->json(['error' => "Tahun tidak valid: {$year}"], 400);
            }

            $monthNum = (int)$month;
            if ($monthNum < 1 || $monthNum > 12) {
                return response()->json(['error' => "Bulan tidak valid: {$month}"], 400);
            }

            // Ensure proper format
            $month = str_pad($monthNum, 2, '0', STR_PAD_LEFT);

            // PERBAIKAN 5: Enhanced unit retrieval with validation
            $unit = Unit::find($unitId);
            if (!$unit) {
                Log::error('Unit not found', ['unit_id' => $unitId]);
                return response()->json([
                    'error' => 'Unit tidak ditemukan',
                    'unit_id' => $unitId
                ], 404);
            }

            // PERBAIKAN 6: Enhanced data retrieval with performance optimization
            try {
                $histories = $this->getDetailLaporan($unitId, $year, $month);

                Log::info('Data retrieved successfully', [
                    'unit_id' => $unitId,
                    'year' => $year,
                    'month' => $month,
                    'histories_count' => $histories->count(),
                    'memory_after_data' => memory_get_usage(true)
                ]);
            } catch (\Exception $dataError) {
                Log::error('Failed to retrieve data', [
                    'error' => $dataError->getMessage(),
                    'unit_id' => $unitId,
                    'year' => $year,
                    'month' => $month
                ]);
                return response()->json([
                    'error' => 'Gagal mengambil data laporan: ' . $dataError->getMessage(),
                    'type' => 'data_retrieval_error'
                ], 500);
            }

            // Check if data exists
            if ($histories->isEmpty()) {
                Log::info('No data found for the specified period', [
                    'unit_id' => $unitId,
                    'year' => $year,
                    'month' => $month
                ]);
                return response()->json([
                    'error' => 'Tidak ada data untuk periode yang diminta',
                    'period' => "{$year}-{$month}",
                    'unit' => $unit->unit_name ?? $unit->name
                ], 404);
            }

            // PERBAIKAN 7: Enhanced summary calculation with error handling
            try {
                $summary = [
                    'totalPendapatan' => $histories->where('jenis', 'Pendapatan')->sum('selisih'),
                    'totalPengeluaran' => $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
                    'jumlahTransaksi' => $histories->count(),
                ];
                $summary['selisih'] = $summary['totalPendapatan'] - $summary['totalPengeluaran'];
            } catch (\Exception $summaryError) {
                Log::error('Failed to calculate summary', [
                    'error' => $summaryError->getMessage(),
                    'histories_count' => $histories->count()
                ]);
                // Continue with default values
                $summary = [
                    'totalPendapatan' => 0,
                    'totalPengeluaran' => 0,
                    'selisih' => 0,
                    'jumlahTransaksi' => 0,
                ];
            }

            // PERBAIKAN 8: Enhanced PDF data preparation
            $monthName = Carbon::createFromDate($year, $month, 1)->translatedFormat('F Y');

            $data = [
                'detailLaporan' => $histories->sortByDesc('updated_at')->values(),
                'bulan' => $monthName,
                'unit' => [
                    'id' => $unit->id_units ?? $unit->id,
                    'name' => $unit->unit_name ?? $unit->name,
                    'type' => $unit->type ?? 'Air Weslik'
                ],
                // TAMBAHAN: Variabel individual untuk kompatibilitas template
                'unitName' => $unit->unit_name ?? $unit->name ?? 'Air Weslik',
                'unitId' => $unit->id_units ?? $unit->id,
                'unitType' => $unit->type ?? 'Air Weslik',
                'summary' => $summary,
                'generated_at' => now()->translatedFormat('l, d F Y H:i') . ' WIB',
                'generated_by' => Auth::user()->name,
                'year' => $year,
                'month' => $month,
                'period' => "{$year}-{$month}",
            ];

            // PERBAIKAN 9: Enhanced view validation
            $viewPath = 'exports.laporan_bumdes_pdf';
            if (!view()->exists($viewPath)) {
                Log::error('PDF View template not found', [
                    'view_path' => $viewPath,
                    'available_views' => array_keys(view()->getFinder()->getViews())
                ]);
                return response()->json([
                    'error' => 'Template PDF tidak ditemukan: ' . $viewPath,
                    'type' => 'template_not_found'
                ], 500);
            }

            // PERBAIKAN 10: Enhanced PDF generation dengan comprehensive error handling
            try {
                Log::info('Starting PDF generation', [
                    'view_path' => $viewPath,
                    'data_summary' => [
                        'laporan_count' => $data['detailLaporan']->count(),
                        'bulan' => $data['bulan'],
                        'unit_name' => $data['unit']['name']
                    ],
                    'memory_before_pdf' => memory_get_usage(true)
                ]);

                // Initialize PDF with optimized settings
                $pdf = PDF::loadView($viewPath, $data);
                $pdf->setPaper('A4', 'landscape');

                // Set comprehensive options
                $pdf->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isPhpEnabled' => false,
                    'isRemoteEnabled' => false, // Security: disable remote resources
                    'debugPng' => false,
                    'debugKeepTemp' => false,
                    'debugCss' => false,
                    'debugLayout' => false,
                    'debugLayoutLines' => false,
                    'debugLayoutBlocks' => false,
                    'debugLayoutInline' => false,
                    'debugLayoutPaddingBox' => false,
                    'defaultFont' => 'DejaVu Sans',
                    'defaultPaperSize' => 'A4',
                    'dpi' => 150,
                    'fontSubsetting' => true,
                    'isFontSubsettingEnabled' => true,
                    'isJavascriptEnabled' => false,
                ]);

                // Generate PDF output
                $output = $pdf->output();

                if (!$output || strlen($output) === 0) {
                    throw new \Exception('PDF output is empty or null');
                }

                Log::info('PDF generation successful', [
                    'output_size' => strlen($output),
                    'memory_after_pdf' => memory_get_usage(true),
                    'peak_memory' => memory_get_peak_usage(true)
                ]);

                // PERBAIKAN 11: Proper filename generation
                $filename = "Detail-Transaksi-Air Weslik-{$year}-{$month}.pdf";

                // PERBAIKAN 12: Enhanced response headers
                $headers = [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                    'Content-Length' => strlen($output),
                    'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                    'X-Accel-Buffering' => 'no',
                    'Accept-Ranges' => 'bytes',
                ];

                Log::info('PDF download successful', [
                    'filename' => $filename,
                    'file_size' => strlen($output),
                    'user_id' => Auth::id(),
                    'unit_id' => $unitId,
                    'period' => "{$year}-{$month}"
                ]);

                return response($output, 200, $headers);
            } catch (\Dompdf\Exception $pdfError) {
                Log::error('DomPDF specific error', [
                    'error' => $pdfError->getMessage(),
                    'line' => $pdfError->getLine(),
                    'file' => basename($pdfError->getFile()),
                    'trace' => $pdfError->getTraceAsString(),
                    'data_summary' => [
                        'laporan_count' => $data['detailLaporan']->count(),
                        'unit_name' => $data['unit']['name'] ?? 'Unknown'
                    ]
                ]);

                return response()->json([
                    'error' => 'Gagal generate PDF (DomPDF Error): ' . $pdfError->getMessage(),
                    'type' => 'dompdf_error',
                    'details' => config('app.debug') ? [
                        'line' => $pdfError->getLine(),
                        'file' => basename($pdfError->getFile())
                    ] : null
                ], 500);
            } catch (\Exception $pdfError) {
                Log::error('PDF Generation general error', [
                    'error' => $pdfError->getMessage(),
                    'line' => $pdfError->getLine(),
                    'file' => basename($pdfError->getFile()),
                    'trace' => $pdfError->getTraceAsString()
                ]);

                return response()->json([
                    'error' => 'Gagal generate PDF: ' . $pdfError->getMessage(),
                    'type' => 'pdf_generation_error',
                    'details' => config('app.debug') ? [
                        'line' => $pdfError->getLine(),
                        'file' => basename($pdfError->getFile())
                    ] : null
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('PDF Download controller error', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile()),
                'trace' => $e->getTraceAsString(),
                'input_params' => [
                    'bulan' => $bulan,
                    'user_id' => Auth::id()
                ],
                'memory_usage' => memory_get_usage(true),
                'peak_memory' => memory_get_peak_usage(true)
            ]);

            return response()->json([
                'error' => 'Terjadi kesalahan sistem saat generate PDF',
                'message' => $e->getMessage(),
                'type' => 'system_error',
                'debug_info' => config('app.debug') ? [
                    'line' => $e->getLine(),
                    'file' => basename($e->getFile()),
                    'memory_usage' => memory_get_usage(true) . ' bytes',
                    'memory_limit' => ini_get('memory_limit')
                ] : null
            ], 500);
        } finally {
            // PERBAIKAN 13: Cleanup memory
            if (isset($pdf)) {
                unset($pdf);
            }
            if (isset($data)) {
                unset($data);
            }
            gc_collect_cycles(); // Force garbage collection

            Log::info('PDF Download process completed', [
                'final_memory_usage' => memory_get_usage(true),
                'peak_memory_usage' => memory_get_peak_usage(true)
            ]);
        }
    }
    // PERBAIKAN 14: Method tambahan untuk debugging dan validasi data
    public function testPdfGeneration($bulan = '2024-01')
    {
        try {
            $unitId = self::UNIT_ID;

            // Test basic components
            $tests = [
                'unit_exists' => Unit::find($unitId) !== null,
                'view_exists' => view()->exists('exports.laporan_pdf'),
                'dompdf_loaded' => class_exists('\Barryvdh\DomPDF\PDF'),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
            ];

            // Test unit data
            $unit = Unit::find($unitId);
            $tests['unit_data'] = $unit ? [
                'id' => $unit->id_units ?? $unit->id,
                'name' => $unit->unit_name ?? $unit->name,
                'available_fields' => array_keys($unit->getAttributes())
            ] : 'Unit not found';

            // Test data retrieval
            try {
                [$year, $month] = explode('-', $bulan);
                $histories = $this->getDetailLaporan($unitId, $year, $month);
                $tests['data_retrieval'] = 'success - ' . $histories->count() . ' records';

                // Test data structure
                if ($histories->count() > 0) {
                    $sampleData = $histories->first();
                    $tests['sample_data_structure'] = array_keys($sampleData);
                }
            } catch (\Exception $e) {
                $tests['data_retrieval'] = 'failed - ' . $e->getMessage();
            }

            // Test PDF with actual data structure
            try {
                $testUnit = Unit::find($unitId);
                $testData = [
                    'detailLaporan' => collect([]),
                    'bulan' => 'Test ' . Carbon::now()->format('F Y'),
                    'unit' => [
                        'id' => $testUnit->id_units ?? $testUnit->id,
                        'name' => $testUnit->unit_name ?? $testUnit->name ?? 'Test Unit',
                        'type' => $testUnit->type ?? 'Air Weslik'
                    ],
                    'unitName' => $testUnit->unit_name ?? $testUnit->name ?? 'Test Unit',
                    'unitId' => $testUnit->id_units ?? $testUnit->id,
                    'unitType' => $testUnit->type ?? 'Air Weslik',
                    'summary' => [
                        'totalPendapatan' => 0,
                        'totalPengeluaran' => 0,
                        'selisih' => 0,
                        'jumlahTransaksi' => 0
                    ],
                    'generated_at' => now()->format('d/m/Y H:i'),
                    'generated_by' => 'Test User',
                    'year' => date('Y'),
                    'month' => date('m'),
                    'period' => date('Y-m')
                ];

                $pdf = PDF::loadView('exports.laporan_pdf', $testData);
                $output = $pdf->output();
                $tests['pdf_generation'] = 'success - ' . strlen($output) . ' bytes';
                $tests['test_data_sent'] = array_keys($testData);
            } catch (\Exception $e) {
                $tests['pdf_generation'] = 'failed - ' . $e->getMessage();
                $tests['pdf_error_line'] = $e->getLine();
                $tests['pdf_error_file'] = basename($e->getFile());
            }

            return response()->json([
                'success' => true,
                'tests' => $tests,
                'recommendations' => $this->getPdfOptimizationRecommendations(),
                'template_variables_expected' => [
                    'detailLaporan' => 'Collection of transaction data',
                    'bulan' => 'Month name (e.g., "Januari 2024")',
                    'unit' => 'Array with id, name, type',
                    'unitName' => 'String - unit name',
                    'unitId' => 'Integer - unit ID',
                    'unitType' => 'String - unit type',
                    'summary' => 'Array with totalPendapatan, totalPengeluaran, selisih, jumlahTransaksi',
                    'generated_at' => 'String - generation timestamp',
                    'generated_by' => 'String - user name',
                    'year' => 'String - year',
                    'month' => 'String - month',
                    'period' => 'String - year-month'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile()),
                'tests' => $tests ?? []
            ], 500);
        }
    }

    // PERBAIKAN 15: Method untuk validasi template variables
    public function validatePdfTemplate()
    {
        try {
            $viewPath = 'exports.laporan_pdf';

            if (!view()->exists($viewPath)) {
                return response()->json([
                    'error' => 'Template tidak ditemukan: ' . $viewPath
                ], 404);
            }

            // Get template content
            $viewFile = resource_path('views/exports/laporan_pdf.blade.php');

            if (file_exists($viewFile)) {
                $content = file_get_contents($viewFile);

                // Extract variables used in template
                preg_match_all('/\$(\w+)/', $content, $matches);
                $templateVariables = array_unique($matches[1]);

                // Check for common problematic patterns
                $issues = [];

                if (strpos($content, '$unitName') !== false && strpos($content, '??') === false) {
                    $issues[] = '$unitName is used without null coalescing operator';
                }

                if (strpos($content, '$unit[') !== false && strpos($content, '??') === false) {
                    $issues[] = '$unit array access without null coalescing operator';
                }

                return response()->json([
                    'success' => true,
                    'template_path' => $viewPath,
                    'file_exists' => true,
                    'template_variables_found' => $templateVariables,
                    'potential_issues' => $issues,
                    'template_size' => strlen($content) . ' characters'
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => 'Template file tidak dapat dibaca'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getPdfOptimizationRecommendations()
    {
        return [
            'memory_limit' => 'Set memory_limit to at least 512M for complex reports',
            'execution_time' => 'Set max_execution_time to at least 300 seconds',
            'php_version' => 'Use PHP 8.1+ for better performance',
            'dompdf_version' => 'Keep DomPDF updated to latest stable version',
            'template_optimization' => 'Minimize complex CSS and avoid large images in PDF templates'
        ];
    }

    public function downloadExcelDetail($bulan)
    {
        try {
            $unitId = self::UNIT_ID;

            // Validasi dan parsing parameter bulan (sama seperti PDF)
            $year = null;
            $month = null;

            if (strpos($bulan, '-') !== false) {
                // Format: YYYY-MM
                [$year, $month] = explode('-', $bulan);
            } elseif (strlen($bulan) === 6 && is_numeric($bulan)) {
                // Format: YYYYMM
                $year = substr($bulan, 0, 4);
                $month = substr($bulan, 4, 2);
            } else {
                // Coba parse sebagai string bulan
                try {
                    $date = Carbon::parse($bulan);
                    $year = $date->year;
                    $month = $date->month;
                } catch (\Exception $e) {
                    return back()->withErrors(['error' => 'Format bulan tidak valid: ' . $bulan]);
                }
            }

            // Validasi year dan month
            if (!$year || !$month || !is_numeric($year) || !is_numeric($month)) {
                return back()->withErrors(['error' => 'Parameter bulan tidak valid']);
            }

            $filename = "Detail-Transaksi-Air Weslik-{$year}-{$month}.xlsx";

            return Excel::download(new DetailLaporanExport($unitId, $year, $month), $filename);
        } catch (\Exception $e) {
            Log::error('Error downloading Excel: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat mendownload Excel']);
        }
    }

    public function storeInitialBalance(Request $request, $unitID)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'nominal' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID) {
            InitialBalance::updateOrCreate(
                ['unit_id' => $unitID],
                ['nominal' => $validated['nominal']]
            );

            // Hapus cache agar data terbaru bisa dimuat
            Cache::forget("initial_balance_{$unitID}");
        });

        return back()->with('info', [
            'message' => 'Saldo awal berhasil diubah',
            'method' => 'create'
        ]);
    }

    public function show($bulan)
    {
        $unitId = self::UNIT_ID;
        [$year, $month] = explode('-', $bulan);
        $unit = Unit::findOrFail($unitId);
        $histories = $this->getDetailLaporan($unitId, $year, $month);

        $summary = [
            'totalPendapatan' => $histories->where('jenis', 'Pendapatan')->sum('selisih'),
            'totalPengeluaran' => $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
            'selisih' => $histories->where('jenis', 'Pendapatan')->sum('selisih')
                - $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
            'jumlahTransaksi' => $histories->count(),
        ];

        return Inertia::render('kepala_bumdes/DetailLaporanAirweslik', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'roles', 'image']),
            ],
            'bulan' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F Y'),
            'unit' => [
                'id' => $unit->id_units,
                'name' => $unit->unit_name,
            ],
            'detailLaporan' => $histories->sortByDesc('updated_at')->values(),
            'summary' => $summary,
        ]);
    }

    private function getInitialBalance(int $unitId): int
    {
        return Cache::remember("initial_balance_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            return InitialBalance::where('unit_id', $unitId)->value('nominal') ?? 0;
        });
    }

    private function getInitialBalanceTanggal(int $unitId): ?string
    {
        return optional(
            InitialBalance::where('unit_id', $unitId)->value('updated_at')
        )?->format('Y-m-d H:i');
    }

    private function getDetailLaporan(int $unitId, string $year, string $month)
    {
        $histories = BalanceHistory::where('unit_id', $unitId)
            ->whereYear('updated_at', $year)
            ->whereMonth('updated_at', $month)
            ->orderByDesc('updated_at')
            ->get();

        return $histories->map(function ($item) use ($unitId) {
            return [
                'id' => $item->id,
                'tanggal' => $item->updated_at->translatedFormat('d F Y'),
                'tanggal_raw' => $item->updated_at->format('Y-m-d'),
                'keterangan' => $this->getTransactionDescription($item, $unitId),
                'jenis' => $item->jenis,
                'selisih' => $this->calculateSelisih($item),
                'saldo' => number_format($item->saldo_sekarang, 0, '', ','),
                'updated_at' => $item->updated_at,
            ];
        });
    }

    private function getRingkasanLaporanBulanan(int $unitId)
    {
        $currentMonth = now()->format('Y-m');

        return BalanceHistory::where('unit_id', $unitId)
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy(fn($item) => $item->updated_at->format('Y-m'))
            ->map(function ($items, $month) use ($unitId, $currentMonth) {
                $totalPendapatan = $items->where('jenis', 'Pendapatan')->sum(fn($item) => $this->calculateSelisih($item));
                $totalPengeluaran = $items->where('jenis', 'Pengeluaran')->sum(fn($item) => $this->calculateSelisih($item));
                $jumlahTransaksi = $items->count();

                // Ambil transaksi terakhir untuk referensi tanggal
                $lastTransaction = $items->sortByDesc('updated_at')->first();

                return [
                    'tanggal' => $lastTransaction->updated_at->translatedFormat('F Y'),
                    'keterangan' => "Ringkasan {$jumlahTransaksi} transaksi",
                    'jenis' => 'Ringkasan',
                    'selisih' => $totalPendapatan - $totalPengeluaran,
                    'saldo' => number_format($lastTransaction->saldo_sekarang, 0, '', ','),
                    'updated_at' => $lastTransaction->updated_at,
                    'bulan' => $month,
                    'is_current_month' => $month === $currentMonth,
                    'summary' => [
                        'totalPendapatan' => $totalPendapatan,
                        'totalPengeluaran' => $totalPengeluaran,
                        'jumlahTransaksi' => $jumlahTransaksi,
                    ]
                ];
            })->values();
    }

    private function getCurrentMonthSummary(int $unitId)
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $histories = BalanceHistory::where('unit_id', $unitId)
            ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
            ->get();

        $pendapatan = $histories->where('jenis', 'Pendapatan')->sum(function ($item) {
            return $this->calculateSelisih($item);
        });

        $pengeluaran = $histories->where('jenis', 'Pengeluaran')->sum(function ($item) {
            return $this->calculateSelisih($item);
        });

        return [
            'pendapatan' => $pendapatan,
            'pengeluaran' => $pengeluaran,
            'selisih' => $pendapatan - $pengeluaran,
            'last_updated' => $histories->max('updated_at')?->format('Y-m-d H:i:s')
        ];
    }


    private function getTransactionDescription($item, int $unitId): string
    {
        $tanggal = $item->updated_at->toDateString();
        $selisih = $this->calculateSelisih($item);

        if ($item->jenis === 'Pendapatan') {
            $tanggal = $item->updated_at->toDateString();
            $selisih = $this->calculateSelisih($item);

            $matchingRents = RentTransaction::with('tarif.unit')
                ->whereDate('updated_at', $tanggal)
                ->get()
                ->filter(function ($r) use ($unitId, $selisih) {
                    return optional($r->tarif?->unit)->id_units == $unitId &&
                        (int) $r->total_bayar === (int) $selisih;
                })
                ->sortBy('updated_at')
                ->values();

            $matchingHistories = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->whereDate('updated_at', $tanggal)
                ->get()
                ->filter(fn($h) => $this->calculateSelisih($h) == $selisih)
                ->sortBy('updated_at')
                ->values();

            $index = $matchingHistories->search(fn($h) => $h->id == $item->id);

            if ($index !== false && isset($matchingRents[$index])) {
                // dd($matchingRents->pluck('description'));
                return $matchingRents[$index]->description ?? 'Pemasukan dari sewa';
            }

            return 'Pemasukan dari sewa';
        }

        if ($item->jenis === 'Pengeluaran') {
            $expenses = Expense::where('unit_id', $unitId)
                ->whereDate('updated_at', $tanggal)
                ->where('nominal', (int) $selisih)
                ->orderBy('updated_at')
                ->get()
                ->values();

            $matchingHistories = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pengeluaran')
                ->whereDate('updated_at', $tanggal)
                ->get()
                ->filter(fn($h) => $this->calculateSelisih($h) == $selisih)
                ->sortBy('updated_at')
                ->values();

            $index = $matchingHistories->search(fn($h) => $h->id == $item->id);

            if ($index !== false && isset($expenses[$index])) {
                return $expenses[$index]->description ?? 'Pengeluaran operasional';
            }

            return 'Pengeluaran operasional';
        }

        return '-';
    }

    private function calculateSelisih($item): int
    {
        return $item->jenis === 'Pendapatan'
            ? $item->saldo_sekarang - $item->saldo_sebelum
            : $item->saldo_sebelum - $item->saldo_sekarang;
    }

    public function storeTarif(Request $request, $unitId)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'category_name' => 'required|string|max:255',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitId) {
            Tarif::create([
                'unit_id' => $unitId,
                'satuan' => 'm3',
                'category_name' => $validated['category_name'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'created_at' => $validated['tanggal'],
                'updated_at' => $validated['tanggal'],
            ]);

            Cache::forget("current_tarif_{$unitId}");
            Cache::forget("all_tarifs_{$unitId}");
        });

        return back()->with('info', [
            'message' => 'Tarif berhasil disimpan',
            'method' => 'create'
        ]);
    }

    public function updateTarif(Request $request, $unitId, $tarifID)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'category_name' => 'required|string',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitId, $tarifID) {
            // Perbaikan: Gunakan id_tarif untuk find tarif yang spesifik
            $tarif = Tarif::where('unit_id', $unitId)
                ->where('id_tarif', $tarifID)
                ->firstOrFail();

            $tarif->update([
                'category_name' => $validated['category_name'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'berlaku_dari' => $validated['tanggal'],
                'updated_at' => now(),
            ]);

            Cache::forget("current_tarif_{$unitId}");
            Cache::forget("all_tarifs_{$unitId}");
        });

        return back()->with('info', [
            'message' => 'Tarif berhasil diperbarui',
            'method' => 'update'
        ]);
    }

    // Method baru untuk delete tarif
    public function deleteTarif(Request $request, $unitId, $tarifID)
    {
        try {
            DB::transaction(function () use ($unitId, $tarifID) {
                $tarif = Tarif::where('id_tarif', $tarifID)
                    ->where('unit_id', $unitId)
                    ->firstOrFail();

                $tarif->delete();

                // Clear cache
                Cache::forget("current_tarif_{$unitId}");
                Cache::forget("all_tarifs_{$unitId}");
            });

            return back()->with('info', [
                'message' => 'Tarif berhasil dihapus',
                'method' => 'delete'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Gagal menghapus tarif: ' . $e->getMessage()
            ]);
        }
    }

    private function getCurrentTarif(int $unitId): ?array
    {
        return Cache::remember("current_tarif_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            $tarif = Tarif::where('unit_id', $unitId)
                ->orderByDesc('updated_at')
                ->first();

            if (!$tarif) {
                return null;
            }

            return [
                'id_tarif' => $tarif->id_tarif,
                'jenis_penyewa' => $tarif->category_name ?? $tarif->jenis_penyewa,
                'category_name' => $tarif->category_name ?? $tarif->jenis_penyewa,
                'harga_per_unit' => $tarif->harga_per_unit,
                'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
                'tanggal' => $tarif->berlaku_dari ? Carbon::parse($tarif->berlaku_dari)->format('Y-m-d') : $tarif->updated_at->format('Y-m-d'),
            ];
        });
    }


    private function getAllTarifs(int $unitId): array
    {
        return Cache::remember("all_tarifs_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            $tarifs = Tarif::where('unit_id', $unitId)
                ->orderByDesc('updated_at')
                ->get();

            return $tarifs->map(function ($tarif) {
                return [
                    'id_tarif' => $tarif->id_tarif,
                    'unit_id' => $tarif->unit_id,
                    'satuan' => $tarif->satuan ?? 'jam',
                    'category_name' => $tarif->category_name ?? $tarif->jenis_penyewa,
                    'harga_per_unit' => $tarif->harga_per_unit,
                    'created_at' => $tarif->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
                ];
            })->toArray();
        });
    }

    public function getTarif()
    {
        $this->authorize('member');

        $tarifs = $this->getAllTarifs(self::UNIT_ID);

        return response()->json($tarifs);
    }

    public function getAllTarifsAPI(Request $request)
    {
        $this->authorize('member');

        $unitId = $request->get('unit_id', self::UNIT_ID);
        $tarifs = $this->getAllTarifs($unitId);

        return response()->json([
            'data' => $tarifs,
            'meta' => [
                'total' => count($tarifs),
                'unit_id' => $unitId,
            ]
        ]);
    }

    public function updateTarifAPI(Request $request)
    {
        $this->authorize('member');

        $validated = $request->validate([
            'id_tarif' => 'required|exists:tarifs,id_tarif',
            'harga_per_unit' => 'required|numeric|min:0',
            'category_name' => 'required|string|in:Umum,Member',
        ]);

        $tarif = Tarif::where('id_tarif', $validated['id_tarif'])
            ->where('unit_id', self::UNIT_ID)
            ->where('category_name', $validated['category_name'])
            ->firstOrFail();

        $updateData = [
            'harga_per_unit' => $validated['harga_per_unit'],
        ];

        $tarif->update($updateData);

        Cache::forget("current_tarif_" . self::UNIT_ID);
        Cache::forget("all_tarifs_" . self::UNIT_ID);

        return response()->json([
            'message' => 'Tarif berhasil diperbarui',
            'data' => [
                'id_tarif' => $tarif->id_tarif,
                'unit_id' => $tarif->unit_id,
                'satuan' => $tarif->satuan,
                'category_name' => $tarif->category_name,
                'harga_per_unit' => $tarif->harga_per_unit,
                'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }
}
