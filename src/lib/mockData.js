// AI-To Mock Data — Örnek veriler (backend hazır olana kadar)
const today = new Date();
const currentYear = today.getFullYear();

export const mockTasks = [
  { id: '1', title: 'Bitirme projesi', description: '', category: 'Eğitim', priority: 'high', status: 'pending', dueDate: today.toISOString(), createdAt: today.toISOString() },
  { id: '2', title: 'Makarna al', description: '', category: 'Kişisel', priority: 'normal', status: 'pending', dueDate: today.toISOString(), createdAt: today.toISOString() }
];

export const mockNotes = [
  { id: '1', title: 'Emirhan 3500TL Borç', content: 'Emirhan\'a olan 3500TL borç', category: 'Finans', createdAt: today.toISOString() }
];

export const mockEvents = [
  { id: '1', title: 'Yasin Abimin doğum günü', description: '2 Nisan Yasin Abimin doğum günü', location: '', startDate: new Date(currentYear, 3, 2).toISOString(), endDate: null, category: 'Kişisel' },
  // { id: '2', title: "Aslı'yla ay dönümümüz", description: "10 Nisan Aslı'yla ay dönümümüz", location: '', startDate: new Date(currentYear, 3, 10).toISOString(), endDate: null, category: 'Kişisel' },
  { id: '3', title: 'Vize haftası', description: '13-16 vize haftası', location: 'Kampüs', startDate: new Date(currentYear, 3, 13).toISOString(), endDate: new Date(currentYear, 3, 16).toISOString(), category: 'Eğitim' },
  { id: '4', title: "Ege'nin doğum günü", description: "15 Nisan Ege'nin doğum günü", location: '', startDate: new Date(currentYear, 3, 15).toISOString(), endDate: null, category: 'Kişisel' }
];

export function getStats() {
  const total = mockTasks.length;
  const completed = mockTasks.filter(t => t.status === 'completed').length;
  const pending = mockTasks.filter(t => t.status === 'pending').length;
  const upcoming = mockEvents.length;
  return { total, completed, pending, upcoming };
}

export function getTodaysTasks() {
  const todayStr = today.toDateString();
  return mockTasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate).toDateString() === todayStr);
}
