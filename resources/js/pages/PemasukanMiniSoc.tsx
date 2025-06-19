import { Button } from "@/components/ui/button";
import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, PageProps } from "@/types";
import { FormEvent, useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Selamat datang, Pengelola Mini soccer", href: "/dashboard" },
];

interface TarifItem {
  id: number;
  tanggal: string;
  penyewa: string;
  tipe: string;
  durasi: number;
  tarif: number;
  total: number;
  keterangan: string;
}

interface Props extends PageProps {
  data: TarifItem[];
}

export default function PemasukanMiniSoc({ auth, data }: Props) {
  const user = auth?.user;
  const [showModal, setShowModal] = useState(false);

  const { data: formData, setData, post, processing, reset } = useForm({
    tanggal: "",
    penyewa: "",
    tipe: "Member",
    durasi: 1,
    tarif: 200000,
    total: 0,
    keterangan: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post("/pemasukan", {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  };

  if (!user) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Pemasukan Mini Soccer" />
        <div className="p-6 text-center text-red-600">
          Gagal memuat data user. Silakan login ulang.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pemasukan Mini Soccer" />

      <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
        <h1 className="text-lg font-semibold text-black">
          Selamat datang, Pengelola Mini soccer
        </h1>
        <div className="flex items-center gap-3">
          <img
            src={user.image || "/assets/images/avatar.png"}
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            <p className="text-xs text-gray-500 mr-3">{user.roles}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 mb-4 mt-3">
        <h2 className="text-xl font-semibold text-gray-800">Pengeluaran - Mini Soccer</h2>
        <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
          Tambah pendapatan harian +
        </Button>
      </div>


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-[4px]">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-black relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Tambah Pendapatan Mini soccer
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  className="border rounded px-4 py-2 w-full outline-none bg-gray-100"
                  value={formData.tanggal}
                  onChange={(e) => setData("tanggal", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penyewa</label>
                <input
                  type="text"
                  placeholder="Nama penyewa"
                  className="border rounded px-4 py-2 w-full outline-none bg-gray-100"
                  value={formData.penyewa}
                  onChange={(e) => setData("penyewa", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi sewa (jam)</label>
                <input
                  type="number"
                  placeholder="Durasi sewa (jam)"
                  className="border rounded px-4 py-2 w-full outline-none bg-gray-100"
                  value={formData.durasi}
                  onChange={(e) => setData("durasi", Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Penyewa</label>
                <select
                  className="border rounded px-4 py-2 w-full outline-none bg-gray-100"
                  value={formData.tipe}
                  onChange={(e) => {
                    const tipe = e.target.value;
                    setData("tipe", tipe);
                    setData("tarif", tipe === "Member" ? 200000 : 300000);
                  }}
                >
                  <option value="Member">Member</option>
                  <option value="Non Member">Non Member</option>
                </select>
              </div>

              <p className="text-sm mt-2">
                Total bayar: <strong>Rp. {(formData.durasi * formData.tarif).toLocaleString("id-ID")}</strong>
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                  Tambah
                </Button>
                <Button
                  type="button"
                  className="bg-gray-300 text-black"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Tabel data */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mx-6">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-gray-100 text-black font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Penyewa</th>
              <th className="px-4 py-3 text-left">Durasi (jam)</th>
              <th className="px-4 py-3 text-left">Tipe penyewa</th>
              <th className="px-4 py-3 text-left">Tarif per jam</th>
              <th className="px-4 py-3 text-left">Total bayar</th>
              <th className="px-4 py-3 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{item.tanggal}</td>
                <td className="px-4 py-3">{item.penyewa}</td>
                <td className="px-4 py-3">{item.durasi}</td>
                <td className="px-4 py-3">{item.tipe}</td>
                <td className="px-4 py-3">
                  Rp. {item.tarif.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  Rp. {item.total.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
