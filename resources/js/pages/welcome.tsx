import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function Welcome() {
    useEffect(() => {
        window.location.href = '/Home'; // Redirect ke /home
    }, []);

    return null; // Tidak menampilkan apapun karena langsung redirect
}
