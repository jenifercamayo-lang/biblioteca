import { useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
  Typography,
} from '@material-tailwind/react';
import { useBooks } from './hooks/useBooks';
import { BooksPage } from './pages/BooksPage';
import { ReservationsPage } from './pages/ReservationsPage';

type ModuleTab = 'books' | 'reservations';

export function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('books');
  const booksState = useBooks();

  const availableCount = useMemo(
    (): number => booksState.books.filter((book) => book.disponibilidad).length,
    [booksState.books]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-gray-100 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold tracking-tight">
              Sistema de Gestión de Biblioteca
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Control de catálogo bibliográfico, disponibilidad y reservas de préstamos
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Chip
              size="sm"
              variant="ghost"
              color="blue-gray"
              value={`Total libros: ${booksState.books.length}`}
            />
            <Chip
              size="sm"
              variant="ghost"
              color="green"
              value={`Disponibles: ${availableCount}`}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab}>
          <Card className="border border-blue-gray-100 shadow-xs">
            <CardBody className="p-2">
              <TabsHeader
                className="bg-blue-gray-50/70"
                indicatorProps={{
                  className: 'bg-white shadow-sm',
                }}
              >
                <Tab
                  value="books"
                  onClick={() => setActiveTab('books')}
                  className="py-2.5 text-sm font-semibold text-blue-gray-800"
                >
                  Catálogo de Libros
                </Tab>
                <Tab
                  value="reservations"
                  onClick={() => setActiveTab('reservations')}
                  className="py-2.5 text-sm font-semibold text-blue-gray-800"
                >
                  Módulo de Reservas
                </Tab>
              </TabsHeader>
            </CardBody>
          </Card>

          <TabsBody className="overflow-visible">
            <TabPanel value="books" className="px-0 pt-6">
              <BooksPage booksState={booksState} />
            </TabPanel>
            <TabPanel value="reservations" className="px-0 pt-6">
              <ReservationsPage books={booksState.books} onBooksRefresh={booksState.fetchBooks} />
            </TabPanel>
          </TabsBody>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
