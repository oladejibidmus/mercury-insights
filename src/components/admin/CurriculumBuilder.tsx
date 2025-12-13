import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit, 
  Video, 
  FileText, 
  HelpCircle, 
  Loader2,
  BookOpen,
  Play
} from "lucide-react";
import { useCurriculumBuilder, CourseModule, CourseLesson } from "@/hooks/useCurriculumBuilder";

interface CurriculumBuilderProps {
  courseId: string;
  courseTitle: string;
}

const lessonTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
};

export function CurriculumBuilder({ courseId, courseTitle }: CurriculumBuilderProps) {
  const { modules, isLoading, createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson } = useCurriculumBuilder(courseId);

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);

  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    type: "video",
    video_url: "",
    content: "",
    duration: "",
  });

  const resetModuleForm = () => setModuleForm({ title: "", description: "" });
  const resetLessonForm = () => setLessonForm({ title: "", type: "video", video_url: "", content: "", duration: "" });

  const handleAddModule = () => {
    createModule.mutate({ course_id: courseId, title: moduleForm.title, description: moduleForm.description });
    setIsAddModuleOpen(false);
    resetModuleForm();
  };

  const handleUpdateModule = () => {
    if (!editingModule) return;
    updateModule.mutate({ id: editingModule.id, title: moduleForm.title, description: moduleForm.description });
    setIsEditModuleOpen(false);
    setEditingModule(null);
    resetModuleForm();
  };

  const handleDeleteModule = (id: string) => {
    if (confirm("Delete this module and all its lessons?")) {
      deleteModule.mutate(id);
    }
  };

  const handleAddLesson = () => {
    if (!selectedModuleId) return;
    createLesson.mutate({
      module_id: selectedModuleId,
      title: lessonForm.title,
      type: lessonForm.type,
      video_url: lessonForm.video_url || undefined,
      content: lessonForm.content || undefined,
      duration: lessonForm.duration || undefined,
    });
    setIsAddLessonOpen(false);
    setSelectedModuleId(null);
    resetLessonForm();
  };

  const handleUpdateLesson = () => {
    if (!editingLesson) return;
    updateLesson.mutate({
      id: editingLesson.id,
      title: lessonForm.title,
      type: lessonForm.type,
      video_url: lessonForm.video_url || null,
      content: lessonForm.content || null,
      duration: lessonForm.duration || null,
    });
    setIsEditLessonOpen(false);
    setEditingLesson(null);
    resetLessonForm();
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm("Delete this lesson?")) {
      deleteLesson.mutate(id);
    }
  };

  const openEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setModuleForm({ title: module.title, description: module.description || "" });
    setIsEditModuleOpen(true);
  };

  const openEditLesson = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      video_url: lesson.video_url || "",
      content: lesson.content || "",
      duration: lesson.duration || "",
    });
    setIsEditLessonOpen(true);
  };

  const openAddLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    resetLessonForm();
    setIsAddLessonOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Curriculum Builder
          </h3>
          <p className="text-sm text-muted-foreground">
            {modules.length} modules · {totalLessons} lessons
          </p>
        </div>
        <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Module Title</Label>
                <Input
                  placeholder="e.g. Introduction to Python"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Brief description of this module..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>Cancel</Button>
                <Button onClick={handleAddModule} disabled={!moduleForm.title || createModule.isPending}>
                  {createModule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Module"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No modules yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Start building your course curriculum by adding the first module.
            </p>
            <Button onClick={() => setIsAddModuleOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {modules.map((module, moduleIndex) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border rounded-lg bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="secondary" className="font-mono">
                    {moduleIndex + 1}
                  </Badge>
                  <span className="font-medium text-left">{module.title}</span>
                  <span className="text-sm text-muted-foreground ml-auto mr-4">
                    {module.lessons?.length || 0} lessons
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {module.description && (
                  <p className="text-sm text-muted-foreground mb-4 pl-10">
                    {module.description}
                  </p>
                )}

                {/* Lessons */}
                <div className="space-y-2 mb-4">
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 rounded-md bg-muted/50 group"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {lessonTypeIcons[lesson.type] || <Play className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium flex-1">
                        {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                      </span>
                      {lesson.duration && (
                        <Badge variant="outline" className="text-xs">
                          {lesson.duration}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {lesson.type}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditLesson(lesson)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Module Actions */}
                <div className="flex items-center gap-2 pl-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddLesson(module.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Lesson
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModule(module)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Module
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Edit Module Dialog */}
      <Dialog open={isEditModuleOpen} onOpenChange={setIsEditModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Module Title</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModuleOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateModule} disabled={!moduleForm.title || updateModule.isPending}>
                {updateModule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="e.g. Variables and Data Types"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text/Article</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  placeholder="e.g. 15 min"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
              </div>
            </div>
            {lessonForm.type === "video" && (
              <div className="space-y-2">
                <Label>YouTube Video URL</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                />
              </div>
            )}
            {lessonForm.type === "text" && (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Lesson content..."
                  rows={4}
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLesson} disabled={!lessonForm.title || createLesson.isPending}>
                {createLesson.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Lesson"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text/Article</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
              </div>
            </div>
            {lessonForm.type === "video" && (
              <div className="space-y-2">
                <Label>YouTube Video URL</Label>
                <Input
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                />
              </div>
            )}
            {lessonForm.type === "text" && (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  rows={4}
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditLessonOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateLesson} disabled={!lessonForm.title || updateLesson.isPending}>
                {updateLesson.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
