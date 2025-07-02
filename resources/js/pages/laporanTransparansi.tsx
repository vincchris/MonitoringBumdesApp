import React from 'react'
import LaporanPage from '@/components/laporanTransparansi-design'
type PageProps = Record<string, any>

const Laporan: React.FC<PageProps> = (props) => {
  return <LaporanPage {...props} />
}

export default Laporan
