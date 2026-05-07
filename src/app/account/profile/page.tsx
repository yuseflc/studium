export default function ProfilePage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>
            <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                    <h2 className="card-title">Información Personal</h2>
                    <p><strong>Nombre:</strong> Juan Pérez</p>
                    <p><strong>Email:</strong> juan.perez@example.com</p>
                </div>
            </div>
        </div>
    );
}