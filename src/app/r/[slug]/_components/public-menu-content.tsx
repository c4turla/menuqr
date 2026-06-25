"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  MapPin,
  MessageCircle,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  X,
  Clock,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Check,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createOrderAction, getOrderAction } from "@/server/actions/order-actions";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  whatsappNumber: string | null;
  slug: string;
  plan: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  featured: boolean;
  categoryName: string | null;
};

interface PublicMenuContentProps {
  restaurant: Restaurant;
  items: MenuItem[];
}

export function PublicMenuContent({ restaurant, items }: PublicMenuContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeOrderIds, setActiveOrderIds] = useState<string[]>([]);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrders, setTrackingOrders] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const table = params.get("table") || params.get("t");
      if (table) {
        setTableNumber(table);
      }
      
      const storageKey = `menuqr_active_orders_${restaurant.id}`;
      try {
        const ids = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setActiveOrderIds(ids);
      } catch (e) {}
    }
  }, [restaurant.id]);

  const fetchTrackingOrders = async () => {
    if (activeOrderIds.length === 0) return;
    setTrackingLoading(true);
    try {
      const fetched = [];
      for (const id of activeOrderIds) {
        const res = await getOrderAction(id);
        if (res.data) {
          fetched.push(res.data);
        }
      }
      setTrackingOrders(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleOpenTracking = async () => {
    setIsTrackingOpen(true);
    await fetchTrackingOrders();
  };

  const handleClearTrackingHistory = () => {
    const storageKey = `menuqr_active_orders_${restaurant.id}`;
    localStorage.removeItem(storageKey);
    setActiveOrderIds([]);
    setTrackingOrders([]);
    setIsTrackingOpen(false);
    toast.success("Riwayat pesanan berhasil dibersihkan");
  };

  // Poll for tracking status update
  useEffect(() => {
    let interval: any;
    if (isTrackingOpen && activeOrderIds.length > 0) {
      interval = setInterval(() => {
        fetchTrackingOrders();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isTrackingOpen, activeOrderIds]);

  const handleOpenChange = (open: boolean) => {
    setIsCartOpen(open);
    if (!open) {
      setOrderSuccess(false);
      setCustomerName("");
    }
  };

  const handleDirectOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Silakan masukkan nama Anda terlebih dahulu");
      return;
    }

    setIsSubmittingOrder(true);
    const toastId = toast.loading("Mengirimkan pesanan Anda...");
    try {
      const orderItems = Object.entries(cart).map(([itemId, qty]) => {
        const item = items.find((i) => i.id === itemId);
        return {
          menuItemId: itemId,
          name: item?.name || "Item",
          price: item?.price || "0",
          quantity: qty,
        };
      });

      const res = await createOrderAction(restaurant.id, {
        tableNumber: tableNumber || undefined,
        customerName: customerName.trim(),
        items: orderItems,
      });

      if (res.error) {
        toast.error(res.error, { id: toastId });
        return;
      }

      // Save order ID to local storage for tracking
      if (res.data?.id) {
        const storageKey = `menuqr_active_orders_${restaurant.id}`;
        let currentActive = [];
        try {
          currentActive = JSON.parse(localStorage.getItem(storageKey) || "[]");
        } catch (e) {}
        currentActive.push(res.data.id);
        localStorage.setItem(storageKey, JSON.stringify(currentActive));
        setActiveOrderIds(currentActive);
      }

      setOrderSuccess(true);
      setCart({}); // clear cart
      toast.success("Pesanan berhasil dikirim!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim pesanan", { id: toastId });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.categoryName) cats.add(item.categoryName);
    });
    return Array.from(cats);
  }, [items]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || item.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const featuredItems = useMemo(() => {
    return filteredItems.filter((item) => item.featured);
  }, [filteredItems]);

  const regularItems = useMemo(() => {
    return filteredItems.filter((item) => !item.featured);
  }, [filteredItems]);

  // Group regular items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    regularItems.forEach((item) => {
      const cat = item.categoryName ?? "Lainnya";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [regularItems]);

  // Cart operations
  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] ?? 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return sum;
      return sum + Number(item.price) * qty;
    }, 0);
  }, [cart, items]);

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Generate WhatsApp text and redirect
  const handleSendOrder = () => {
    if (!restaurant.whatsappNumber) return;

    const isPremium = restaurant.plan === "basic" || restaurant.plan === "pro";
    const hasTable = tableNumber && isPremium;

    let message = `Halo *${restaurant.name}*,\n`;
    if (hasTable) {
      message += `Saya memesan dari *MEJA ${tableNumber}*:\n\n`;
    } else {
      message += `Saya ingin memesan:\n\n`;
    }
    
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        message += `*${qty}x* ${item.name} (${formatPrice(Number(item.price) * qty)})\n`;
      }
    });

    message += `\n*Total: ${formatPrice(totalPrice)}*\n\nTerima kasih!`;

    const cleanPhone = restaurant.whatsappNumber.replace(/\D/g, "");
    // Ensure Indonesian phone starts with 62 instead of 0
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }
    
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-50 dark:bg-neutral-950 pb-28 shadow-xl relative">
      {/* Cover Image */}
      <div className="relative h-44 w-full bg-neutral-200 dark:bg-neutral-800">
        {restaurant.coverUrl ? (
          <Image
            src={restaurant.coverUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-400 to-amber-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-transparent" />
      </div>

      {/* Restaurant Header */}
      <div className="relative px-5 pt-0 pb-5 -mt-10">
        <div className="flex items-end gap-3.5 mb-3">
          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-4 border-white dark:border-neutral-950 bg-white shadow-md">
            {restaurant.logoUrl ? (
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-xl">
                {restaurant.name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-black text-white leading-tight drop-shadow-sm">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-300">
                <MapPin className="h-3 w-3 text-orange-400" />
                <span className="truncate max-w-[200px]">{restaurant.address}</span>
              </div>
            )}
            {tableNumber && (restaurant.plan === "basic" || restaurant.plan === "pro") && (
              <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                Meja {tableNumber}
              </div>
            )}
          </div>
        </div>

        {restaurant.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            {restaurant.description}
          </p>
        )}
      </div>

      {/* Sticky Filter & Search */}
      <div className="sticky top-0 z-10 bg-neutral-50/95 dark:bg-neutral-950/95 px-5 py-3 backdrop-blur border-b border-neutral-100 dark:border-neutral-900 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Cari makanan atau minuman..."
            className="pl-10 pr-4 py-5 rounded-full border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
              selectedCategory === "all"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items list */}
      <div className="px-5 mt-4 flex-1 space-y-6">
        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <h2 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">Rekomendasi</h2>
            </div>
            <div className="grid gap-3">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 shadow-sm"
                >
                  {item.imageUrl && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0 justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-orange-500">
                        {formatPrice(Number(item.price))}
                      </span>
                      {cart[item.id] ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{cart[item.id]}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-500 text-[10px] font-bold hover:bg-orange-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Tambah
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Items Grouped by Category */}
        {Object.entries(groupedItems).map(([catName, catItems]) => (
          <div key={catName} className="space-y-3">
            <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
              {catName}
            </h3>
            <div className="grid gap-3">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 shadow-sm"
                >
                  {item.imageUrl && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0 justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-orange-500">
                        {formatPrice(Number(item.price))}
                      </span>
                      {cart[item.id] ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{cart[item.id]}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-500 text-[10px] font-bold hover:bg-orange-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Tambah
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center text-neutral-400 dark:text-neutral-600">
            <p className="text-xs font-bold">Menu tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-4 shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-neutral-900 dark:ring-white">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">Total Harga</p>
                <p className="text-sm font-black">{formatPrice(totalPrice)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
              Lihat Keranjang
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Summary Modal */}
      <Dialog open={isCartOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xs rounded-2xl p-5 gap-4">
          {orderSuccess ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 text-green-500 shadow-sm animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Pesanan Terkirim!</h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed font-medium">
                  Pesanan Anda sudah masuk ke sistem kami dan sedang disiapkan oleh dapur. 
                  {tableNumber && (restaurant.plan === "basic" || restaurant.plan === "pro") && (
                    <span> Pesanan akan diantarkan langsung ke <strong>Meja ${tableNumber}</strong>.</span>
                  )}
                </p>
              </div>
              <Button 
                onClick={() => handleOpenChange(false)}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl py-4 text-xs font-black"
              >
                Tutup & Lihat Menu
              </Button>
            </div>
          ) : (
            /* Normal Cart State */
            <>
              <DialogHeader>
                <DialogTitle className="text-sm font-extrabold flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-orange-500" />
                  Detail Pesanan
                </DialogTitle>
                {tableNumber && (restaurant.plan === "basic" || restaurant.plan === "pro") && (
                  <p className="text-[10px] font-bold text-neutral-400 text-left mt-0.5">
                    Ditempatkan di: <span className="text-orange-500 font-extrabold uppercase">Meja {tableNumber}</span>
                  </p>
                )}
              </DialogHeader>
              
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[40vh] overflow-y-auto pr-1">
                {Object.entries(cart).map(([itemId, qty]) => {
                  const item = items.find((i) => i.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex items-center justify-between py-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-orange-500 font-black mt-0.5">{formatPrice(Number(item.price))}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(itemId, -1)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="text-xs font-extrabold w-4 text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(itemId, 1)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-neutral-400">Total Pembayaran</span>
                  <span className="text-orange-500 text-sm font-black">{formatPrice(totalPrice)}</span>
                </div>

                {/* POS Details Form if basic/pro */}
                {(restaurant.plan === "basic" || restaurant.plan === "pro") ? (
                  <div className="space-y-3.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        Nama Anda
                      </label>
                      <Input
                        type="text"
                        placeholder="Masukkan nama Anda..."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500 py-4"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleDirectOrder}
                        disabled={isSubmittingOrder || !customerName.trim()}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-5 text-xs font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                      >
                        Pesan Langsung (POS)
                      </Button>
                      
                      {restaurant.whatsappNumber && (
                        <button
                          onClick={handleSendOrder}
                          className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex items-center justify-center gap-1 mt-1 py-1"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                          Atau Kirim via WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Free plan: WhatsApp Checkout only */
                  <>
                    {restaurant.whatsappNumber ? (
                      <Button
                        onClick={handleSendOrder}
                        className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-5 text-xs font-black shadow-md shadow-green-500/20 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Kirim Pesanan via WhatsApp
                      </Button>
                    ) : (
                      <p className="text-[10px] text-center text-neutral-400">Nomor WhatsApp belum dikonfigurasi</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Orders Tracker Floating Button */}
      {activeOrderIds.length > 0 && (
        <div className="fixed bottom-4 left-4 z-30">
          <button
            onClick={handleOpenTracking}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all relative border border-orange-400"
            title="Lacak Pesanan"
          >
            <ClipboardList className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-[10px] font-black text-white dark:text-neutral-900 ring-2 ring-orange-500">
              {activeOrderIds.length}
            </span>
          </button>
        </div>
      )}

      {/* Tracking Modal */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-xs rounded-2xl p-5 gap-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-orange-500" />
              Lacak Pesanan
            </DialogTitle>
          </DialogHeader>

          {trackingLoading && trackingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <p className="text-[10px] text-neutral-400 font-bold">Memuat status pesanan...</p>
            </div>
          ) : trackingOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-neutral-400 font-bold">Tidak ada pesanan aktif</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
              {trackingOrders.map((order, index) => {
                const orderTime = new Date(order.createdAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                
                // Determine step index based on status
                let currentStep = 0; // pending = 0
                if (order.status === "processing") currentStep = 1;
                if (order.status === "completed") currentStep = 2;
                if (order.status === "cancelled") currentStep = -1;

                return (
                  <div key={order.id} className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-3.5 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                      <span>Pesanan #{index + 1}</span>
                      <span>{orderTime}</span>
                    </div>

                    {/* Timeline */}
                    {order.status === "cancelled" ? (
                      <div className="flex items-center gap-3 text-red-500 py-1">
                        <XCircle className="h-5 w-5 shrink-0" />
                        <span className="text-xs font-black">Pesanan Dibatalkan</span>
                      </div>
                    ) : (
                      <div className="space-y-4 relative pl-5 border-l-2 border-neutral-200 dark:border-neutral-800 ml-2.5">
                        {/* Step 1: Received */}
                        <div className="relative">
                          <span className={`absolute -left-[27px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black text-white bg-orange-500`}>
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <div className="pl-1.5">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Diterima</h4>
                            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1">Pesanan masuk ke sistem antrean</p>
                          </div>
                        </div>

                        {/* Step 2: Cooking */}
                        <div className="relative">
                          <span className={`absolute -left-[27px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black text-white ${
                            currentStep >= 1 ? "bg-orange-500" : "bg-neutral-200 dark:bg-neutral-800"
                          }`}>
                            {currentStep > 1 ? (
                              <Check className="h-2.5 w-2.5" />
                            ) : currentStep === 1 ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                            ) : (
                              "2"
                            )}
                          </span>
                          <div className="pl-1.5">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Sedang Dimasak</h4>
                            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">Chef sedang menyiapkan hidangan Anda</p>
                          </div>
                        </div>

                        {/* Step 3: Served */}
                        <div className="relative">
                          <span className={`absolute -left-[27px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black text-white ${
                            currentStep >= 2 ? "bg-green-500" : "bg-neutral-200 dark:bg-neutral-800"
                          }`}>
                            {currentStep >= 2 ? <Check className="h-2.5 w-2.5" /> : "3"}
                          </span>
                          <div className="pl-1.5">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Selesai & Disajikan</h4>
                            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1">Hidangan siap di meja Anda</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order summary mini */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 text-[10px] space-y-1">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-neutral-500">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-neutral-900 dark:text-white pt-1.5">
                        <span>Total Bayar</span>
                        <span className="text-orange-500">{formatPrice(Number(order.totalPrice))}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              onClick={handleClearTrackingHistory}
              variant="outline"
              className="w-full rounded-xl py-4 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-neutral-200 dark:border-neutral-800"
            >
              Bersihkan Riwayat Lacak
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
