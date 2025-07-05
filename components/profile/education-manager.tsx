"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GraduationCap, Calendar, MapPin, Award, Edit3, Save, X } from "lucide-react"

export interface EducationEntry {
  id: string
  degree: string
  field_of_study: string
  school: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  gpa?: number
  description?: string
  activities?: string[]
  honors?: string[]
}

interface EducationManagerProps {
  education: EducationEntry[]
  onChange: (education: EducationEntry[]) => void
  disabled?: boolean
}

const DEGREE_TYPES = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
  "Professional Degree (JD, MD, etc.)",
  "Certificate",
  "Diploma",
  "Other",
]

const COMMON_FIELDS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Marketing",
  "Finance",
  "Accounting",
  "Economics",
  "Psychology",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Statistics",
  "Data Science",
  "Graphic Design",
  "Communications",
  "English",
  "History",
  "Political Science",
  "Sociology",
  "Education",
  "Nursing",
  "Medicine",
  "Law",
  "Other",
]

export function EducationManager({ education, onChange, disabled = false }: EducationManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Create new education entry
  const createNewEntry = useCallback(
    (): EducationEntry => ({
      id: Date.now().toString(),
      degree: "",
      field_of_study: "",
      school: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      gpa: undefined,
      description: "",
      activities: [],
      honors: [],
    }),
    [],
  )

  // Add new education entry
  const addEducation = useCallback(() => {
    const newEntry = createNewEntry()
    onChange([...education, newEntry])
    setEditingId(newEntry.id)
    setShowAddForm(true)
  }, [education, onChange, createNewEntry])

  // Update education entry
  const updateEducation = useCallback(
    (id: string, updates: Partial<EducationEntry>) => {
      onChange(education.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)))
    },
    [education, onChange],
  )

  // Remove education entry
  const removeEducation = useCallback(
    (id: string) => {
      onChange(education.filter((entry) => entry.id !== id))
      if (editingId === id) {
        setEditingId(null)
      }
    },
    [education, onChange, editingId],
  )

  // Start editing
  const startEditing = useCallback((id: string) => {
    setEditingId(id)
    setShowAddForm(false)
  }, [])

  // Stop editing
  const stopEditing = useCallback(() => {
    setEditingId(null)
    setShowAddForm(false)
  }, [])

  // Generate years for dropdowns
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </CardTitle>
        <CardDescription>Add your educational background to showcase your qualifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Education Entries */}
        {education.map((entry) => (
          <Card key={entry.id} className="relative">
            <CardContent className="pt-6">
              {editingId === entry.id ? (
                // Edit Form
                <EducationForm
                  entry={entry}
                  onUpdate={(updates) => updateEducation(entry.id, updates)}
                  onSave={stopEditing}
                  onCancel={stopEditing}
                  disabled={disabled}
                />
              ) : (
                // Display View
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{entry.degree || "Degree"}</h4>
                        {entry.is_current && <Badge variant="secondary">Current</Badge>}
                      </div>
                      {entry.field_of_study && <p className="text-gray-600 mb-1">{entry.field_of_study}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {entry.school || "School Name"}
                        </div>
                        {entry.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {entry.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {entry.start_date} - {entry.is_current ? "Present" : entry.end_date || "End Date"}
                        </div>
                      </div>
                      {entry.gpa && (
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>GPA: {entry.gpa}</span>
                        </div>
                      )}
                      {entry.description && <p className="text-sm text-gray-700 mt-2">{entry.description}</p>}
                      {entry.activities && entry.activities.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Activities:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.activities.map((activity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {entry.honors && entry.honors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Honors & Awards:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.honors.map((honor, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {honor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => startEditing(entry.id)} disabled={disabled}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(entry.id)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add New Education Form */}
        {showAddForm && editingId && (
          <Card>
            <CardContent className="pt-6">
              <EducationForm
                entry={education.find((e) => e.id === editingId)!}
                onUpdate={(updates) => updateEducation(editingId, updates)}
                onSave={stopEditing}
                onCancel={() => {
                  removeEducation(editingId)
                  stopEditing()
                }}
                disabled={disabled}
                isNew={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Add Education Button */}
        {!showAddForm && (
          <Button variant="outline" onClick={addEducation} disabled={disabled} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}

        {/* Education Tips */}
        {education.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No education added yet</p>
            <p className="text-sm">
              Add your educational background to improve your profile completeness and job matching.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Education Form Component
interface EducationFormProps {
  entry: EducationEntry
  onUpdate: (updates: Partial<EducationEntry>) => void
  onSave: () => void
  onCancel: () => void
  disabled?: boolean
  isNew?: boolean
}

function EducationForm({ entry, onUpdate, onSave, onCancel, disabled = false, isNew = false }: EducationFormProps) {
  const [activities, setActivities] = useState(entry.activities?.join(", ") || "")
  const [honors, setHonors] = useState(entry.honors?.join(", ") || "")

  const handleSave = useCallback(() => {
    // Validate required fields
    if (!entry.degree || !entry.school || !entry.start_date) {
      return
    }

    // Update activities and honors arrays
    onUpdate({
      activities: activities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
      honors: honors
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h),
    })

    onSave()
  }, [entry, activities, honors, onUpdate, onSave])

  const isValid = entry.degree && entry.school && entry.start_date

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">{isNew ? "Add Education" : "Edit Education"}</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={disabled}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={disabled || !isValid}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree">Degree Type *</Label>
          <Select value={entry.degree} onValueChange={(value) => onUpdate({ degree: value })} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select degree type" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_TYPES.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="field">Field of Study</Label>
          <Select
            value={entry.field_of_study}
            onValueChange={(value) => onUpdate({ field_of_study: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field of study" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_FIELDS.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school">School/Institution *</Label>
          <Input
            id="school"
            value={entry.school}
            onChange={(e) => onUpdate({ school: e.target.value })}
            placeholder="University of Example"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={entry.location || ""}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="City, State"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Year *</Label>
          <Select
            value={entry.start_date}
            onValueChange={(value) => onUpdate({ start_date: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Start year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Year</Label>
          <Select
            value={entry.end_date || ""}
            onValueChange={(value) => onUpdate({ end_date: value })}
            disabled={disabled || entry.is_current}
          >
            <SelectTrigger>
              <SelectValue placeholder="End year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gpa">GPA (Optional)</Label>
          <Input
            id="gpa"
            type="number"
            min="0"
            max="4"
            step="0.01"
            value={entry.gpa || ""}
            onChange={(e) => onUpdate({ gpa: e.target.value ? Number.parseFloat(e.target.value) : undefined })}
            placeholder="3.75"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_current"
          checked={entry.is_current}
          onCheckedChange={(checked) =>
            onUpdate({
              is_current: checked as boolean,
              end_date: checked ? "" : entry.end_date,
            })
          }
          disabled={disabled}
        />
        <Label htmlFor="is_current">I am currently enrolled</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={entry.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe your studies, relevant coursework, thesis, etc."
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="activities">Activities & Societies</Label>
          <Input
            id="activities"
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="Student Government, Chess Club, etc. (comma-separated)"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="honors">Honors & Awards</Label>
          <Input
            id="honors"
            value={honors}
            onChange={(e) => setHonors(e.target.value)}
            placeholder="Dean's List, Magna Cum Laude, etc. (comma-separated)"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
