import React, { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    title = '',
    description = '',
    keywords = '',
    image = '',
}) => {
    const fullTitle = title
        ? `${title} - BUMDES Cihaurbeuti`
        : 'BUMDES Cihaurbeuti - Membangun Desa Melalui Ekonomi Kreatif';

    const metaDescription =
        description ||
        'Badan Usaha Milik Desa Cihaurbeuti menyediakan berbagai unit usaha dan layanan untuk kesejahteraan masyarakat desa.';

    const metaKeywords =
        keywords ||
        'BUMDES, Cihaurbeuti, Unit Usaha, Mini Soccer, Internet Desa, Air Bersih';

    const metaImage = image || '/images/hero-bumdes.jpg';

    return (
        <>
            <Head>
                <title>{fullTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={metaKeywords} />
                <meta property="og:title" content={fullTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={metaImage} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={fullTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={metaImage} />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
            </Head>

            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-16">{children}</main>
                <Footer />
            </div>
        </>
    );
};

export default MainLayout;