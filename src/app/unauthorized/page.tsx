import { getServerSession } from 'next-auth';
import { authOptions } from '@/../auth.config';
import { redirect } from 'next/navigation';

export default async function RolePage() {
  const session = await getServerSession(authOptions);

  // Om användaren inte är inloggad, redirecta till login
  if (!session?.user) {
    redirect('/login');
  }

  // Hämta användarens roll
  type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';
  const userRole = session.user.role as Role;

  // Färger baserat på roll
  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-red-500',
    STAFF: 'bg-blue-500',
    CUSTOMER: 'bg-green-500',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Din användarroll</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Inloggad som:</span>
            <span>{session.user.name || session.user.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Din roll:</span>
            <span 
              className={`px-3 py-1 rounded-full text-white ${roleColors[userRole] ?? 'bg-gray-500'}`}
            >
              {userRole}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Rollbeskrivningar:</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${roleColors.ADMIN}`}></span>
              <span>ADMIN - Fullständig åtkomst till allt</span>
            </li>
            <li className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${roleColors.STAFF}`}></span>
              <span>STAFF - Begränsad administrativ åtkomst</span>
            </li>
            <li className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${roleColors.CUSTOMER}`}></span>
              <span>CUSTOMER - Grundläggande användarbehörigheter</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-center">
          <a 
            href="/dashboard" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Tillbaka till dashboard
          </a>
        </div>
      </div>
    </div>
  );
}