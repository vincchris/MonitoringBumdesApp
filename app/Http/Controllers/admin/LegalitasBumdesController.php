<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\LegalitasBumdes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LegalitasBumdesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $legalitas = LegalitasBumdes::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/Legalitas', [
            'legalitas' => $legalitas,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'number'         => 'required|string|max:255|unique:legalitas_bumdes,number',
            'document_image' => 'nullable|file|mimes:jpeg,jpg,png|max:5120', // Maks 5MB
        ], [
            'name.required'           => 'Nama dokumen wajib diisi.',
            'name.max'                => 'Nama dokumen maksimal 255 karakter.',
            'number.required'         => 'Nomor dokumen wajib diisi.',
            'number.max'              => 'Nomor dokumen maksimal 255 karakter.',
            'number.unique'           => 'Nomor dokumen sudah ada, gunakan nomor berbeda.',
            'document_image.mimes'    => 'Format file harus jpeg, jpg, atau png.',
            'document_image.max'      => 'Ukuran file maksimal 5MB.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)
                ->withInput()
                ->with('flash', [
                    'info' => [
                        'message' => 'Terjadi kesalahan validasi data.',
                        'method'  => 'error',
                    ],
                ]);
        }

        try {
            $data = $request->only(['name', 'number']);

            if ($request->hasFile('document_image')) {
                $file     = $request->file('document_image');
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $path     = $file->storeAs('documents/legalitas', $filename, 'public');
                $data['document_image'] = $path;
            }

            LegalitasBumdes::create($data);

            return redirect()->route('legalitas.index')
                ->with('flash', [
                    'info' => [
                        'message' => 'Data legalitas berhasil ditambahkan.',
                        'method'  => 'create',
                    ],
                ]);
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('flash', [
                    'info' => [
                        'message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage(),
                        'method'  => 'error',
                    ],
                ]);
        }
    }

    /**
     * Perbarui data legalitas.
     */
    public function update(Request $request, $id)
    {
        $legalitas = LegalitasBumdes::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'number'         => 'required|string|max:255|unique:legalitas_bumdes,number,' . $id,
            'document_image' => 'nullable|file|mimes:jpeg,jpg,png|max:5120',
        ], [
            'name.required'           => 'Nama dokumen wajib diisi.',
            'name.max'                => 'Nama dokumen maksimal 255 karakter.',
            'number.required'         => 'Nomor dokumen wajib diisi.',
            'number.max'              => 'Nomor dokumen maksimal 255 karakter.',
            'number.unique'           => 'Nomor dokumen sudah ada, gunakan nomor berbeda.',
            'document_image.mimes'    => 'Format file harus jpeg, jpg, atau png.',
            'document_image.max'      => 'Ukuran file maksimal 5MB.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)
                ->withInput()
                ->with('flash', [
                    'info' => [
                        'message' => 'Terjadi kesalahan validasi data.',
                        'method'  => 'error',
                    ],
                ]);
        }

        try {
            $data = $request->only(['name', 'number']);

            if ($request->hasFile('document_image')) {
                if ($legalitas->document_image && Storage::disk('public')->exists($legalitas->document_image)) {
                    Storage::disk('public')->delete($legalitas->document_image);
                }

                $file     = $request->file('document_image');
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $path     = $file->storeAs('documents/legalitas', $filename, 'public');
                $data['document_image'] = $path;
            }

            $legalitas->update($data);

            return redirect()->route('legalitas.index')
                ->with('flash', [
                    'info' => [
                        'message' => 'Data legalitas berhasil diperbarui.',
                        'method'  => 'update',
                    ],
                ]);
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('flash', [
                    'info' => [
                        'message' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage(),
                        'method'  => 'error',
                    ],
                ]);
        }
    }

    /**
     * Hapus data legalitas.
     */
    public function destroy($id)
    {
        try {
            $legalitas = LegalitasBumdes::findOrFail($id);

            if ($legalitas->document_image && Storage::disk('public')->exists($legalitas->document_image)) {
                Storage::disk('public')->delete($legalitas->document_image);
            }

            $legalitas->delete();

            return redirect()->route('legalitas.index')
                ->with('flash', [
                    'info' => [
                        'message' => 'Data legalitas berhasil dihapus.',
                        'method'  => 'delete',
                    ],
                ]);
        } catch (\Exception $e) {
            return back()->with('flash', [
                'info' => [
                    'message' => 'Terjadi kesalahan saat menghapus data: ' . $e->getMessage(),
                    'method'  => 'error',
                ],
            ]);
        }
    }
}
