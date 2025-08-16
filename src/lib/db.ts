import { openDB } from 'idb'

const DB_NAME = 'sugrow-db'
const STORE_NAME = 'transactions'

// Define the Transaction interface (should match your main component)
interface Transaction {
  id: string
  type: "stock-in" | "stock-out" | "income" | "expense"
  name: string
  item?: string
  quantity?: number
  amount?: number
  notes?: string
  date: Date
}

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

// Fix: Replace 'any' with 'Transaction'
export async function addTransaction(transaction: Transaction) {
  const db = await getDB()
  await db.put(STORE_NAME, transaction)
}

export async function getAllTransactions() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function deleteTransaction(id: string) {
  const db = await getDB()
  return db.delete(STORE_NAME, id)
}