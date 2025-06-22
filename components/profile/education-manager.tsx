"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GraduationCap, Plus, Edit, Trash2, Calendar, MapPin, Award, AlertCircle } from "lucide-react"
import { type EducationEntry } from "@/lib/supabase"
import { validationUtils } from "@/lib/validation"

interface EducationManagerProps {
  education: EducationEntry[]
  onChange: (education: EducationEntry[]) => void
  disabled?: boolean
}

export function EducationManager({ education, onChange, disabled = false }: EducationManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<EducationEntry>({
    institution: "",
    degree: "",
    field: "",
    start_date: "",
    end_date: "",
    description: "",
    gpa: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      institution: "",
      degree: "",
      field: "",
      start_date: "",
      end_date: "",
      description: "",
      gpa: undefined
    })
    setErrors({})
    setEditingIndex(null)
  }, [])

  // Open dialog for adding new education
  const handleAdd = useCallback(() => {
    resetForm()
    setIsDialogOpen(true)
  }, [resetForm])

  // Open dialog for editing education
  const handleEdit = useCallback((index: number) => {
    setFormData(education[index])
    setEditingIndex(index)
    setIsDialogOpen(true)
  }, [education])

  // Delete education entry
  const handleDelete = useCallback((index: number) => {
    const newEducation = education.filter((_, i) => i !== index)
    onChange(newEducation)
  }, [education, onChange])

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.institution.trim()) {
      newErrors.institution = "Institution is required"
    }
    if (!formData.degree.trim()) {
      newErrors.degree = "Degree is required"
    }
    if (!formData.field.trim()) {
      newErrors.field = "Field of study is required"
    }

    // Date validation
    if (formData.start_date && !validationUtils.validateDate(formData.start_date)) {
      newErrors.start_date = "Invalid start date"
    }
    if (formData.end_date && !validationUtils.validateDate(formData.end_date)) {
      newErrors.end_date = "Invalid end date"
    }

    // Date range validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        newErrors.end_date = "End date cannot be before start date"
      }
    }

    // GPA validation
    if (formData.gpa !== undefined && formData.gpa !== null) {
      const gpa = Number(formData.gpa)
      if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        newErrors.gpa = "GPA must be between 0 and 4"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return

    const newEducation = [...education]
    
    if (editingIndex !== null) {
      // Update existing entry
      newEducation[editingIndex] = { ...formData }
    } else {
      // Add new entry
      newEducation.push({ ...formData })
    }

    onChange(newEducation)
    setIsDialogOpen(false)
    resetForm()
  }, [formData, education, editingIndex, onChange, validateForm, resetForm])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof EducationEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }, [errors])

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }, [])

  // Get current status
  const getCurrentStatus = useCallback((entry: EducationEntry) => {
    if (!entry.start_date) return "Unknown"
    
    const startDate = new Date(entry.start_date)
    const endDate = entry.end_date ? new Date(entry.end_date) : null
    const now = new Date()
    
    if (endDate) {
      return "Completed"
    } else if (startDate <= now) {
      return "In Progress"
    } else {
      return "Planned"
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </CardTitle>
        <CardDescription>
          Add your educational background and qualifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Education List */}
        {education.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No education entries yet</p>
            <p className="text-sm">Add your educational background to enhance your profile</p>
          </div>
        ) : (
          <div className="space-y-3">
            {education.map((entry, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{entry.institution}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getCurrentStatus(entry)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>{entry.degree} in {entry.field}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      {entry.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.start_date)}</span>
                          {entry.end_date && <span> - {formatDate(entry.end_date)}</span>}
                        </div>
                      )}
                      {entry.gpa && (
                        <div className="flex items-center gap-1">
                          <span>GPA: {entry.gpa}</span>
                        </div>
                      )}
                    </div>
                    
                    {entry.description && (
                      <p className="text-sm text-gray-600 mt-2">{entry.description}</p>
                    )}
                  </div>
                  
                  {!disabled && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Education Button */}
        {!disabled && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIndex !== null ? "Edit Education" : "Add Education"}
                </DialogTitle>
                <DialogDescription>
                  Enter your educational details. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Institution */}
                <div className="space-y-2">
                  <Label htmlFor="institution">
                    Institution * <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => handleFieldChange("institution", e.target.value)}
                    placeholder="University of Technology"
                    className={errors.institution ? "border-red-500" : ""}
                  />
                  {errors.institution && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.institution}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Degree and Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">
                      Degree * <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="degree"
                      value={formData.degree}
                      onChange={(e) => handleFieldChange("degree", e.target.value)}
                      placeholder="Bachelor of Science"
                      className={errors.degree ? "border-red-500" : ""}
                    />
                    {errors.degree && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.degree}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field">
                      Field of Study * <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="field"
                      value={formData.field}
                      onChange={(e) => handleFieldChange("field", e.target.value)}
                      placeholder="Computer Science"
                      className={errors.field ? "border-red-500" : ""}
                    />
                    {errors.field && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.field}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleFieldChange("start_date", e.target.value)}
                      className={errors.start_date ? "border-red-500" : ""}
                    />
                    {errors.start_date && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.start_date}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date (leave empty if ongoing)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleFieldChange("end_date", e.target.value)}
                      className={errors.end_date ? "border-red-500" : ""}
                    />
                    {errors.end_date && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.end_date}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* GPA */}
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA (optional)</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa || ""}
                    onChange={(e) => handleFieldChange("gpa", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="3.8"
                    className={errors.gpa ? "border-red-500" : ""}
                  />
                  {errors.gpa && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.gpa}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Describe your studies, achievements, or relevant coursework..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingIndex !== null ? "Update" : "Add"} Education
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
} 