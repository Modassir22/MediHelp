import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for development (use database in production)
let medicineDatabase: any[] = [
  {
    id: 'paracetamol_500',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    manufacturer: 'Generic Pharma',
    category: 'Analgesic',
    dosage: {
      min: '500mg',
      max: '1000mg',
      frequency: 'Every 4-6 hours'
    },
    uses: ['Fever', 'Headache', 'Pain relief', 'Cold symptoms'],
    sideEffects: ['Nausea', 'Liver damage (overdose)', 'Allergic reactions'],
    embeddings: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
    imageFeatures: Array.from({ length: 256 }, () => Math.random() * 2 - 1)
  },
  {
    id: 'ibuprofen_400',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    manufacturer: 'Generic Pharma',
    category: 'NSAID',
    dosage: {
      min: '200mg',
      max: '800mg',
      frequency: 'Every 6-8 hours'
    },
    uses: ['Pain relief', 'Inflammation', 'Fever', 'Arthritis'],
    sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness'],
    embeddings: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
    imageFeatures: Array.from({ length: 256 }, () => Math.random() * 2 - 1)
  }
]

export async function GET() {
  try {
    return NextResponse.json(medicineDatabase)
  } catch (error) {
    console.error('Error fetching medicines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const medicineData = await request.json()
    
    // Add timestamp and ID if not provided
    const newMedicine = {
      ...medicineData,
      id: medicineData.id || `medicine_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    medicineDatabase.push(newMedicine)
    
    return NextResponse.json(newMedicine, { status: 201 })
  } catch (error) {
    console.error('Error creating medicine:', error)
    return NextResponse.json(
      { error: 'Failed to create medicine' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const medicineData = await request.json()
    const { id } = medicineData
    
    const index = medicineDatabase.findIndex(m => m.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }
    
    medicineDatabase[index] = {
      ...medicineDatabase[index],
      ...medicineData,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(medicineDatabase[index])
  } catch (error) {
    console.error('Error updating medicine:', error)
    return NextResponse.json(
      { error: 'Failed to update medicine' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Medicine ID required' },
        { status: 400 }
      )
    }
    
    const index = medicineDatabase.findIndex(m => m.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }
    
    const deletedMedicine = medicineDatabase.splice(index, 1)[0]
    
    return NextResponse.json(deletedMedicine)
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return NextResponse.json(
      { error: 'Failed to delete medicine' },
      { status: 500 }
    )
  }
}