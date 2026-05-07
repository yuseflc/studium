import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, Calendar, CheckSquare, MessageSquare, Clock, Users, GraduationCap, ClipboardList } from 'lucide-react'

const MESCHAC_AVATAR = 'https://avatars.githubusercontent.com/u/47919550?v=4'
const BERNARD_AVATAR = 'https://avatars.githubusercontent.com/u/31113941?v=4'
const THEO_AVATAR = 'https://avatars.githubusercontent.com/u/68236786?v=4'
const GLODIE_AVATAR = 'https://avatars.githubusercontent.com/u/99137927?v=4'

export default function FeaturesSection() {
    return (
        <section className="bg-base-200">
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-base-content max-w-full text-balance text-4xl font-bold tracking-tight text-center">Todo lo que necesitas para tu éxito académico</h2>
                        <p className="mt-4 text-lg text-base-content/70 text-center">Una plataforma integral diseñada para conectar a estudiantes y profesores de manera eficiente.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-base-100 border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-6 group">
                            <div className="bg-primary/50 p-3 rounded-2xl w-fit group-hover:bg-primary group-hover:text-primary-content transition-colors">
                                <Calendar className="size-6 text-base-content" />
                            </div>
                            <h3 className="text-base-content mt-6 text-xl font-bold">Gestión de Clases</h3>
                            <p className="text-base-content/70 mt-3 text-balance leading-relaxed">Apúntate a clases con un solo clic. Consulta horarios y recibe notificaciones de nuevas sesiones.</p>

                            <div className="mt-8">
                                <ClassIllustration />
                            </div>
                        </Card>

                        <Card className="bg-base-100 border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-6 group">
                            <div className="bg-secondary/50 p-3 rounded-2xl w-fit group-hover:bg-secondary group-hover:text-secondary-content transition-colors">
                                <ClipboardList className="size-6 text-base-content" />
                            </div>
                            <h3 className="text-base-content mt-6 text-xl font-bold">Entregas y Tareas</h3>
                            <p className="text-base-content/70 mt-3 text-balance leading-relaxed">Envía tus tareas fácilmente, mantén un seguimiento de las fechas límite y organiza tus entregas.</p>

                            <div className="mt-8">
                                <TaskIllustration />
                            </div>
                        </Card>

                        <Card className="bg-base-100 border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-6 group">
                            <div className="bg-accent/50 p-3 rounded-2xl w-fit group-hover:bg-accent group-hover:text-accent-content transition-colors">
                                <MessageSquare className="size-6" />
                            </div>
                            <h3 className="text-base-content mt-6 text-xl font-bold">Feedback Directo</h3>
                            <p className="text-base-content/70 mt-3 text-balance leading-relaxed">Recibe correcciones y consejos personalizados de tus profesores para mejorar en cada paso.</p>

                            <div className="mt-8">
                                <FeedbackIllustration />
                            </div>
                        </Card>
                    </div>
                    
                    <div className="mt-6">
                        <Card className="bg-base-100 border-none shadow-xl p-8 flex flex-col md:flex-row items-center gap-8 group">
                            <div className="flex-1">
                                <div className="bg-info/50 text-info p-3 rounded-2xl w-fit mb-6 group-hover:bg-info group-hover:text-info-content transition-colors">
                                    <Clock className="size-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-base-content">Archivo Histórico</h3>
                                <p className="text-base-content/70 text-lg leading-relaxed">
                                    No pierdas nunca el acceso a tu conocimiento. Revisa temas de cursos anteriores, materiales de estudio y grabaciones en cualquier momento.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
                                    <span className="badge badge-outline gap-1 p-3 text-base-content bg-primary font-bold"><BookOpen size={14}/> Temarios</span>
                                    <span className="badge badge-outline gap-1 p-3 text-base-content bg-secondary font-bold"><Users size={14}/> Antiguos Compañeros</span>
                                    <span className="badge badge-outline gap-1 p-3 text-base-content bg-info font-bold"><GraduationCap size={14}/> Certificados</span>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 bg-base-200 rounded-3xl p-6 shadow-inner relative overflow-hidden h-48 md:h-auto">
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-base-100 p-3 rounded-xl shadow-sm flex items-center gap-3 animate-pulse" style={{ opacity: 1 - i * 0.2 }}>
                                            <div className="size-8 rounded-lg bg-base-300 flex items-center justify-center">
                                                <BookOpen className="size-4 opacity-50" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-2/3 bg-base-300 rounded" />
                                                <div className="h-1.5 w-1/3 bg-base-300/50 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-transparent to-transparent flex items-end justify-center pb-4">
                                    <span className="text-xs font-bold opacity-30 tracking-widest uppercase text-base-content">Historial del Curso 2024/25</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}

const ClassIllustration = () => {
    return (
        <Card className="bg-base-200 border-none shadow-inner aspect-video p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-sm font-bold text-base-content">Matemáticas Avanzadas</div>
                    <div className="text-[10px] text-base-content/50 uppercase tracking-wider font-semibold">Aula 302 • Dr. Bernard</div>
                </div>
                <div className="badge badge-success badge-sm text-success-content font-bold">Inscrito</div>
            </div>
            
            <div className="bg-base-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium">
                    <Clock size={12} className="text-primary" />
                    <span className="text-base-content">Lunes, 10:00 AM</span>
                </div>
                <Button size="sm" className="h-7 text-[10px] bg-primary text-primary-content border-none hover:bg-primary/80">Entrar</Button>
            </div>
        </Card>
    )
}

const TaskIllustration = () => {
    return (
        <div className="relative group/illust">
            <Card className="bg-base-200 border-none aspect-video w-[85%] translate-y-2 p-4 transition-all duration-500 group-hover:rotate-[-2deg] group-hover:scale-105 shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold opacity-50 text-base-content">ENTREGA DE PROYECTO</span>
                    <div className="size-2 rounded-full bg-warning animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-base-content/10 rounded-full" />
                    <div className="h-2 w-3/4 bg-base-content/10 rounded-full" />
                </div>
                <div className="mt-2 p-2 border-2 border-dashed border-base-content/20 rounded-lg flex items-center justify-center gap-2">
                    <ClipboardList className="size-4 opacity-30 text-base-content" />
                    <span className="text-[10px] font-medium opacity-50 text-base-content">Arrastrar archivo aquí</span>
                </div>
            </Card>
            <Card className="absolute top-2 right-0 w-1/3 aspect-square bg-secondary text-secondary-content flex flex-col items-center justify-center p-2 rounded-2xl shadow-xl transition-all duration-500 group-hover:rotate-[6deg] group-hover:translate-x-2">
                <CheckSquare className="size-6 mb-1" />
                <span className="text-[8px] font-bold">RECIBIDO</span>
            </Card>
        </div>
    )
}

const FeedbackIllustration = () => {
    return (
        <Card className="bg-base-200 border-none aspect-video translate-y-4 p-4 transition-all duration-500 group-hover:translate-y-0 shadow-md">
            <div className="flex items-center gap-2 mb-3">
                <div className="avatar w-6 h-6 ring ring-accent ring-offset-base-200 ring-offset-2 rounded-full">
                    <img src={GLODIE_AVATAR} alt="Teacher" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-base-content">Profa. Glodie</span>
                    <span className="text-[8px] opacity-50 text-base-content">Hace 5 minutos</span>
                </div>
            </div>
            <div className="bg-base-100 p-2.5 rounded-xl rounded-tl-none border border-base-300/30 text-[10px] leading-relaxed italic shadow-sm text-base-content">
                "Excelente progreso en este tema. Te sugiero revisar el capítulo 4 para reforzar la base teórica."
            </div>
            <div className="mt-3 flex gap-1 items-center justify-end">
                <div className="badge badge-accent badge-xs font-bold p-2">+3 Puntos extra</div>
            </div>
        </Card>
    )
}