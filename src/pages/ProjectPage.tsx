import { useParams } from 'react-router-dom';
import Canvas from '../components/Canvas';
import { useAuthStore } from '../stores/authStore';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();

  if (!projectId || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen">
      <Canvas projectId={projectId} userId={user.id} />
    </div>
  );
} 