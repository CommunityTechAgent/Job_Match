"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, Plus, Search, Code, Database, Globe, Smartphone, Palette, BarChart3 } from "lucide-react"

interface SkillsSelectorProps {
  selectedSkills: string[]
  onChange: (skills: string[]) => void
  disabled?: boolean
}

// Comprehensive skills database organized by category
const SKILLS_DATABASE = {
  "Programming Languages": [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Scala",
    "R",
    "MATLAB",
    "Perl",
    "Lua",
    "Dart",
    "Elixir",
    "Haskell",
  ],
  "Frontend Development": [
    "React",
    "Vue.js",
    "Angular",
    "Svelte",
    "Next.js",
    "Nuxt.js",
    "HTML5",
    "CSS3",
    "SASS",
    "LESS",
    "Tailwind CSS",
    "Bootstrap",
    "Material-UI",
    "Ant Design",
    "Chakra UI",
    "Styled Components",
    "Webpack",
    "Vite",
    "Parcel",
    "Rollup",
  ],
  "Backend Development": [
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "ASP.NET",
    "Ruby on Rails",
    "Laravel",
    "Symfony",
    "NestJS",
    "Koa.js",
    "Hapi.js",
    "Gin",
    "Echo",
    "Fiber",
  ],
  Databases: [
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    "SQL Server",
    "Cassandra",
    "DynamoDB",
    "Firebase",
    "Supabase",
    "PlanetScale",
    "CockroachDB",
    "Neo4j",
    "InfluxDB",
  ],
  "Cloud & DevOps": [
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "GitLab CI",
    "GitHub Actions",
    "Terraform",
    "Ansible",
    "Chef",
    "Puppet",
    "Vagrant",
    "Nginx",
    "Apache",
    "Linux",
    "Ubuntu",
  ],
  "Mobile Development": [
    "React Native",
    "Flutter",
    "iOS Development",
    "Android Development",
    "Xamarin",
    "Ionic",
    "Cordova",
    "PhoneGap",
    "Unity",
    "Unreal Engine",
  ],
  "Data Science & AI": [
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Jupyter",
    "Apache Spark",
    "Hadoop",
    "Tableau",
    "Power BI",
    "D3.js",
    "Matplotlib",
    "Seaborn",
  ],
  "Design & UX": [
    "UI/UX Design",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Photoshop",
    "Illustrator",
    "InVision",
    "Principle",
    "Framer",
    "Zeplin",
    "User Research",
    "Wireframing",
    "Prototyping",
    "Design Systems",
  ],
  "Project Management": [
    "Agile",
    "Scrum",
    "Kanban",
    "Jira",
    "Trello",
    "Asana",
    "Monday.com",
    "Notion",
    "Confluence",
    "Slack",
    "Microsoft Teams",
    "Project Planning",
    "Risk Management",
    "Stakeholder Management",
  ],
  "Testing & QA": [
    "Jest",
    "Cypress",
    "Selenium",
    "Playwright",
    "Testing Library",
    "Mocha",
    "Chai",
    "Jasmine",
    "Unit Testing",
    "Integration Testing",
    "E2E Testing",
    "Performance Testing",
    "Load Testing",
  ],
}

// Popular skills that appear as quick suggestions
const POPULAR_SKILLS = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "AWS",
  "Docker",
  "Git",
  "SQL",
  "MongoDB",
  "Express.js",
  "Next.js",
  "Vue.js",
  "Angular",
  "Java",
  "C++",
  "Machine Learning",
  "UI/UX Design",
  "Agile",
  "Scrum",
]

export function SkillsSelector({ selectedSkills, onChange, disabled = false }: SkillsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [customSkill, setCustomSkill] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Filter skills based on search term
  const filteredSkills = useCallback(() => {
    if (!searchTerm) return []

    const allSkills = Object.values(SKILLS_DATABASE).flat()
    return allSkills
      .filter((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedSkills.includes(skill))
      .slice(0, 10)
  }, [searchTerm, selectedSkills])

  // Add skill to selection
  const addSkill = useCallback(
    (skill: string) => {
      if (!selectedSkills.includes(skill) && skill.trim()) {
        onChange([...selectedSkills, skill.trim()])
        setSearchTerm("")
        setCustomSkill("")
        setIsPopoverOpen(false)
      }
    },
    [selectedSkills, onChange],
  )

  // Remove skill from selection
  const removeSkill = useCallback(
    (skillToRemove: string) => {
      onChange(selectedSkills.filter((skill) => skill !== skillToRemove))
    },
    [selectedSkills, onChange],
  )

  // Add custom skill
  const addCustomSkill = useCallback(() => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      addSkill(customSkill.trim())
    }
  }, [customSkill, addSkill])

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Programming Languages":
        return <Code className="h-4 w-4" />
      case "Databases":
        return <Database className="h-4 w-4" />
      case "Frontend Development":
        return <Globe className="h-4 w-4" />
      case "Mobile Development":
        return <Smartphone className="h-4 w-4" />
      case "Design & UX":
        return <Palette className="h-4 w-4" />
      case "Data Science & AI":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Code className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Skills & Technologies
        </CardTitle>
        <CardDescription>
          Add your technical skills and expertise. Start typing to search or browse by category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Add Skills */}
        <div className="space-y-2">
          <Label>Search Skills</Label>
          <div className="flex gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for skills (e.g., React, Python, AWS)..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setIsPopoverOpen(e.target.value.length > 0)
                    }}
                    className="pl-10"
                    disabled={disabled}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandList>
                    {filteredSkills().length > 0 ? (
                      <CommandGroup>
                        {filteredSkills().map((skill) => (
                          <CommandItem key={skill} onSelect={() => addSkill(skill)} className="cursor-pointer">
                            {skill}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : searchTerm ? (
                      <CommandEmpty>
                        No skills found. Add "{searchTerm}" as a custom skill?
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 bg-transparent"
                          onClick={() => addSkill(searchTerm)}
                        >
                          Add "{searchTerm}"
                        </Button>
                      </CommandEmpty>
                    ) : null}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Add Custom Skill */}
        <div className="space-y-2">
          <Label>Add Custom Skill</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomSkill()}
              disabled={disabled}
            />
            <Button onClick={addCustomSkill} disabled={!customSkill.trim() || disabled} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Popular Skills */}
        <div className="space-y-2">
          <Label>Popular Skills</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.filter((skill) => !selectedSkills.includes(skill))
              .slice(0, 10)
              .map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  disabled={disabled}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {skill}
                </Button>
              ))}
          </div>
        </div>

        {/* Skills by Category */}
        <div className="space-y-4">
          <Label>Browse by Category</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SKILLS_DATABASE).map(([category, skills]) => (
              <Card key={category} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(category)}
                  <h4 className="font-medium text-sm">{category}</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skills
                    .filter((skill) => !selectedSkills.includes(skill))
                    .slice(0, 6)
                    .map((skill) => (
                      <Button
                        key={skill}
                        variant="ghost"
                        size="sm"
                        onClick={() => addSkill(skill)}
                        disabled={disabled}
                        className="h-6 text-xs px-2 hover:bg-blue-50"
                      >
                        {skill}
                      </Button>
                    ))}
                  {skills.filter((skill) => !selectedSkills.includes(skill)).length > 6 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{skills.filter((skill) => !selectedSkills.includes(skill)).length - 6} more
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Skills ({selectedSkills.length})</Label>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(skill)}
                    disabled={disabled}
                    className="h-4 w-4 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills Summary */}
        {selectedSkills.length > 0 && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Skills Summary:</p>
            <p>
              You have selected {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""}. Having 8-15
              relevant skills typically provides the best job matching results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
