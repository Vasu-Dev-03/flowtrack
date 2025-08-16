"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, PackageOpen, CreditCard, History, Calendar, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type TransactionType = "stock-in" | "stock-out" | "income" | "expense"

interface Transaction {
  id: string
  type: TransactionType
  name: string
  item?: string
  quantity?: number
  amount?: number
  notes?: string
  date: Date
}

export default function FlowTrack() {
  const [currentView, setCurrentView] = useState<"main" | "stock-in" | "stock-out" | "payment" | "history">("main")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [historyFilter, setHistoryFilter] = useState<"all" | TransactionType>("all")

  // Form states
  const [stockForm, setStockForm] = useState({
    name: "",
    item: "",
    quantity: "",
    notes: "",
    date: new Date(),
  })

  const [paymentForm, setPaymentForm] = useState({
    name: "",
    amount: "",
    date: new Date(),
  })

  const [paymentType, setPaymentType] = useState<"income" | "expense">("income")

  useEffect(() => {
    const savedTransactions = localStorage.getItem("flowtrack-transactions")
    if (savedTransactions) {
      try {
        const parsed: Transaction[] = JSON.parse(savedTransactions)
        // Convert date strings back to Date objects
        const transactionsWithDates: Transaction[] = parsed.map((t) => ({
          ...t,
          date: new Date(t.date),
        }))
        setTransactions(transactionsWithDates)
      } catch (error) {
        console.error("Error loading transactions:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("flowtrack-transactions", JSON.stringify(transactions))
    }
  }, [transactions])

  const resetForms = () => {
    setStockForm({
      name: "",
      item: "",
      quantity: "",
      notes: "",
      date: new Date(),
    })
    setPaymentForm({
      name: "",
      amount: "",
      date: new Date(),
    })
  }

  const handleStockSubmit = (type: "stock-in" | "stock-out") => {
    if (!stockForm.name || !stockForm.item || !stockForm.quantity) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      name: stockForm.name,
      item: stockForm.item,
      quantity: Number.parseInt(stockForm.quantity),
      notes: stockForm.notes,
      date: stockForm.date,
    }

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev]
      localStorage.setItem("flowtrack-transactions", JSON.stringify(updated))
      return updated
    })
    resetForms()
    setCurrentView("main")
  }

  const handlePaymentSubmit = () => {
    if (!paymentForm.name || !paymentForm.amount) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: paymentType,
      name: paymentForm.name,
      amount: Number.parseFloat(paymentForm.amount),
      date: paymentForm.date,
    }

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev]
      localStorage.setItem("flowtrack-transactions", JSON.stringify(updated))
      return updated
    })
    resetForms()
    setCurrentView("main")
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      if (updated.length === 0) {
        localStorage.removeItem("flowtrack-transactions")
      } else {
        localStorage.setItem("flowtrack-transactions", JSON.stringify(updated))
      }
      return updated
    })
  }

  const filteredTransactions = transactions.filter((t) => historyFilter === "all" || t.type === historyFilter)

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "stock-in":
        return <Package className="h-4 w-4" />
      case "stock-out":
        return <PackageOpen className="h-4 w-4" />
      case "income":
        return <CreditCard className="h-4 w-4 text-green-600" />
      case "expense":
        return <CreditCard className="h-4 w-4 text-red-600" />
    }
  }

  const getTransactionBadge = (type: TransactionType) => {
    const variants = {
      "stock-in": "bg-blue-100 text-blue-800",
      "stock-out": "bg-orange-100 text-orange-800",
      income: "bg-green-100 text-green-800",
      expense: "bg-red-100 text-red-800",
    }

    return <Badge className={cn("capitalize", variants[type])}>{type.replace("-", " ")}</Badge>
  }

  if (currentView === "main") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2 font-serif font-extrabold text-4xl">Sugrow</h1>
            <p className="text-muted-foreground">Inventory & Payment Tracking</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setCurrentView("stock-in")}
              className="h-32 flex flex-col gap-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Package className="h-8 w-8" />
              <span className="text-lg font-semibold">Stock In</span>
            </Button>

            <Button
              onClick={() => setCurrentView("stock-out")}
              className="h-32 flex flex-col gap-3 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <PackageOpen className="h-8 w-8" />
              <span className="text-lg font-semibold">Stock Out</span>
            </Button>

            <Button
              onClick={() => setCurrentView("payment")}
              className="h-32 flex flex-col gap-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="h-8 w-8" />
              <span className="text-lg font-semibold">Payment</span>
            </Button>

            <Button
              onClick={() => setCurrentView("history")}
              className="h-32 flex flex-col gap-3 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <History className="h-8 w-8" />
              <span className="text-lg font-semibold">History</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "stock-in" || currentView === "stock-out") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold capitalize">{currentView.replace("-", " ")}</h1>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={stockForm.name}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">Item</Label>
                <Input
                  id="item"
                  value={stockForm.item}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, item: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(stockForm.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={stockForm.date}
                      onSelect={(date) => date && setStockForm((prev) => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={stockForm.notes}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => handleStockSubmit(currentView as "stock-in" | "stock-out")}
                className="w-full"
                disabled={!stockForm.name || !stockForm.item || !stockForm.quantity}
              >
                Save Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentView === "payment") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Payment</h1>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as "income" | "expense")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-name">Name</Label>
                    <Input
                      id="income-name"
                      value={paymentForm.name}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter source name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income-amount">Amount</Label>
                    <Input
                      id="income-amount"
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="expense" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-name">Name</Label>
                    <Input
                      id="expense-name"
                      value={paymentForm.name}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter expense name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">Amount</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                    />
                  </div>
                </TabsContent>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="payment-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(paymentForm.date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={paymentForm.date}
                        onSelect={(date) => date && setPaymentForm((prev) => ({ ...prev, date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={handlePaymentSubmit}
                  className="w-full mt-6"
                  disabled={!paymentForm.name || !paymentForm.amount}
                >
                  Save {paymentType}
                </Button>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentView === "history") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">History</h1>
          </div>

          <div className="mb-4">
            <Select
              value={historyFilter}
              onValueChange={(value) => setHistoryFilter(value as TransactionType | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="stock-in">Stock In</SelectItem>
                <SelectItem value="stock-out">Stock Out</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">No transactions found</CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getTransactionIcon(transaction.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTransactionBadge(transaction.type)}
                            <span className="text-sm text-muted-foreground">
                              {format(transaction.date, "MMM dd, yyyy")}
                            </span>
                          </div>
                          <p className="font-semibold">{transaction.name}</p>
                          {transaction.item && (
                            <p className="text-sm text-muted-foreground">
                              {transaction.item} × {transaction.quantity}
                            </p>
                          )}
                          {transaction.amount && (
                            <p
                              className={cn(
                                "text-sm font-medium",
                                transaction.type === "income" ? "text-green-600" : "text-red-600",
                              )}
                            >
                              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                            </p>
                          )}
                          {transaction.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
