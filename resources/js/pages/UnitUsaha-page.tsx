import UnitusahaPage from '@/components/unitUsahaPage-design';
import { usePage } from '@inertiajs/react';

interface TarifItem {
    id: number;
    label: string;
    detail: string;
    basePrice: number;
}

type Tarifs = {
    [unitId: string]: TarifItem[];
};

interface Booking {
    id: number;
    tenant: string;
    tarif_id: number;
    unit_id: number;
    nominal: number;
    total: number;
    description: string;
    updated_at: string;
    created_at: string;
}

const UnitUsaha = () => {
    const { tarifs, bookings } = usePage().props as unknown as {
        tarifs: Tarifs;
        bookings: Booking[];
    };

    return <UnitusahaPage tarifs={tarifs} bookings={bookings} />;
};

export default UnitUsaha;
