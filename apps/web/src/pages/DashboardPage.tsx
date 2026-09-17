  // Custom Date Filters
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report Detail Modal States
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let url = '/dashboard/stats?';
        if (startDate && endDate) {
          url += `startDate=${startDate}&endDate=${endDate}`;
        } else if (month) {
          url += `month=${month}`;
        }
        const response = await api.get(url);
        if (response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [month, startDate, endDate]);

  const openDetail = async (id: string, type: string) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/inspections/${type.toLowerCase()}/${id}`);
      if (res.data?.data) {
        setSelectedReport(res.data.data);
        setSelectedReportType(type);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load report detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <>
    <div className="pb-16 max-w-[1400px] w-full mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Utama</h2>
          <p className="text-base text-gray-500 mt-1">Ringkasan performa dan kesehatan aset perusahaan.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-3 border-r border-gray-200">
            <label className="text-sm font-medium text-gray-600">Bulan:</label>
            <input 
              type="month" 
              value={month} 
              onChange={e => { setMonth(e.target.value); setStartDate(''); setEndDate(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 px-3">
            <label className="text-sm font-medium text-gray-600">Range:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => { setStartDate(e.target.value); setMonth(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
            <span className="text-gray-400 text-sm">sd</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => { setEndDate(e.target.value); setMonth(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
          </div>
          <button 
            onClick={handlePrint} 
            className="ml-auto bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary-fixed-variant flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
          </button>
        </div>
      </div>

      {stats ? (
        <NewDashboard stats={stats} openDetail={openDetail} exportPDF={handlePrint} />
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium">Loading dashboard data...</p>
           </div>
        </div>
      )}
    </div>
    </>
  );
};
