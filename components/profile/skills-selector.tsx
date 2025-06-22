"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, X, Search, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

// Predefined skill categories and skills
const SKILL_CATEGORIES = {
  "Programming Languages": [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
    "PHP", "Ruby", "Scala", "R", "MATLAB", "Perl", "Haskell", "Clojure", "Elixir", "Dart"
  ],
  "Frontend Development": [
    "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "HTML5", "CSS3", "Sass", "Less",
    "Tailwind CSS", "Bootstrap", "Material-UI", "Ant Design", "Webpack", "Vite", "Babel", "ESLint"
  ],
  "Backend Development": [
    "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
    "FastAPI", "Gin", "Echo", "Fiber", "Koa", "Hapi", "Sails.js", "Strapi", "NestJS"
  ],
  "Databases": [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server", "MariaDB",
    "Cassandra", "DynamoDB", "Firebase", "Supabase", "CouchDB", "Neo4j", "InfluxDB"
  ],
  "Cloud & DevOps": [
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitLab CI",
    "GitHub Actions", "Ansible", "Chef", "Puppet", "Vagrant", "Helm", "Istio", "Prometheus"
  ],
  "Mobile Development": [
    "React Native", "Flutter", "Ionic", "Xamarin", "SwiftUI", "Android SDK", "iOS SDK",
    "Cordova", "PhoneGap", "NativeScript", "Expo", "Firebase Mobile"
  ],
  "Data Science & AI": [
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn",
    "Jupyter", "Apache Spark", "Hadoop", "Kafka", "Airflow", "MLflow", "Kubeflow"
  ],
  "Design & UX": [
    "Figma", "Adobe XD", "Sketch", "InVision", "Framer", "Adobe Photoshop", "Adobe Illustrator",
    "Adobe After Effects", "Principle", "Protopie", "User Research", "Usability Testing"
  ],
  "Testing": [
    "Jest", "Cypress", "Selenium", "Playwright", "Puppeteer", "Mocha", "Chai", "Jasmine",
    "RTL", "Vitest", "Playwright", "TestCafe", "Appium", "Detox"
  ],
  "Other Technologies": [
    "GraphQL", "REST APIs", "WebSockets", "gRPC", "Microservices", "Serverless", "JAMstack",
    "Progressive Web Apps", "WebAssembly", "Blockchain", "IoT", "AR/VR", "Game Development"
  ]
}

interface SkillsSelectorProps {
  selectedSkills: string[]
  onChange: (skills: string[]) => void
  maxSkills?: number
  placeholder?: string
  disabled?: boolean
}

export function SkillsSelector({ 
  selectedSkills, 
  onChange, 
  maxSkills = 20, 
  placeholder = "Add skills...",
  disabled = false 
}: SkillsSelectorProps) {
  const [inputValue, setInputValue] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])

  // Flatten all skills for search
  const allSkills = Object.values(SKILL_CATEGORIES).flat()

  // Filter skills based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSkills([])
      return
    }

    const filtered = allSkills.filter(skill => 
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedSkills.includes(skill)
    ).slice(0, 10) // Limit to 10 suggestions

    setFilteredSkills(filtered)
  }, [inputValue, selectedSkills, allSkills])

  // Add skill
  const addSkill = useCallback((skill: string) => {
    const trimmedSkill = skill.trim()
    if (!trimmedSkill) return

    if (selectedSkills.length >= maxSkills) {
      return
    }

    if (!selectedSkills.includes(trimmedSkill)) {
      onChange([...selectedSkills, trimmedSkill])
    }
    setInputValue("")
    setIsPopoverOpen(false)
  }, [selectedSkills, onChange, maxSkills])

  // Remove skill
  const removeSkill = useCallback((skillToRemove: string) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove))
  }, [selectedSkills, onChange])

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.trim()) {
      setIsPopoverOpen(true)
    } else {
      setIsPopoverOpen(false)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addSkill(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1])
    }
  }

  // Get skill category
  const getSkillCategory = (skill: string) => {
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      if (skills.includes(skill)) {
        return category
      }
    }
    return "Other"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Skills
        </CardTitle>
        <CardDescription>
          Add your technical skills and expertise. You can select from suggestions or add custom skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Skills Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Selected Skills ({selectedSkills.length}/{maxSkills})</label>
            {selectedSkills.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>
          
          {selectedSkills.length === 0 ? (
            <div className="text-sm text-gray-500 italic">
              No skills added yet. Start typing to add skills.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="group cursor-pointer hover:bg-red-100 hover:text-red-700"
                  onClick={() => !disabled && removeSkill(skill)}
                >
                  <span className="text-xs text-gray-500 mr-1">
                    {getSkillCategory(skill)}
                  </span>
                  {skill}
                  {!disabled && (
                    <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Skill Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Skills</label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={placeholder}
                  disabled={disabled || selectedSkills.length >= maxSkills}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => inputValue.trim() && addSkill(inputValue)}
                  disabled={!inputValue.trim() || selectedSkills.length >= maxSkills}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </PopoverTrigger>
            
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search skills..." />
                <CommandList>
                  <CommandEmpty>No skills found.</CommandEmpty>
                  
                  {/* Filtered suggestions */}
                  {filteredSkills.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {filteredSkills.map((skill) => (
                        <CommandItem
                          key={skill}
                          onSelect={() => addSkill(skill)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span>{skill}</span>
                            <Badge variant="outline" className="text-xs">
                              {getSkillCategory(skill)}
                            </Badge>
                          </div>
                          <Plus className="h-4 w-4" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Browse by category */}
                  <CommandGroup heading="Browse by Category">
                    {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                      <CommandItem
                        key={category}
                        onSelect={() => {
                          // Show sub-items for this category
                          const availableSkills = skills.filter(skill => !selectedSkills.includes(skill))
                          if (availableSkills.length > 0) {
                            // For now, just add the first available skill
                            addSkill(availableSkills[0])
                          }
                        }}
                        className="flex items-center justify-between"
                      >
                        <span>{category}</span>
                        <ChevronsUpDown className="h-4 w-4" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {selectedSkills.length >= maxSkills && (
            <p className="text-sm text-amber-600">
              Maximum number of skills reached ({maxSkills}). Remove some skills to add more.
            </p>
          )}
        </div>

        {/* Skill Categories Overview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Skill Categories</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => {
              const selectedInCategory = skills.filter(skill => selectedSkills.includes(skill))
              return (
                <div
                  key={category}
                  className="p-2 border rounded text-xs cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    // Show skills in this category
                    const availableSkills = skills.filter(skill => !selectedSkills.includes(skill))
                    if (availableSkills.length > 0) {
                      setInputValue("")
                      setIsPopoverOpen(true)
                    }
                  }}
                >
                  <div className="font-medium">{category}</div>
                  <div className="text-gray-500">
                    {selectedInCategory.length} of {skills.length} selected
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Start typing to see skill suggestions</p>
          <p>💡 <strong>Tip:</strong> Press Enter to add a custom skill</p>
          <p>💡 <strong>Tip:</strong> Click on a skill badge to remove it</p>
        </div>
      </CardContent>
    </Card>
  )
} 