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
  Utensils,
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
  themePrimaryColor: string | null;
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
  modifiers?: any[] | null;
};

interface PublicMenuContentProps {
  restaurant: Restaurant;
  items: MenuItem[];
}

export function PublicMenuContent({ restaurant, items }: PublicMenuContentProps) {
  type SelectedModifiers = {
    [groupId: string]: {
      groupName: string;
      options: {
        name: string;
        price: number;
      }[];
    };
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, {
    itemId: string;
    quantity: number;
    selectedModifiers: SelectedModifiers;
  }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [isTableLocked, setIsTableLocked] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeOrderIds, setActiveOrderIds] = useState<string[]>([]);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrders, setTrackingOrders] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const [activeModifiers, setActiveModifiers] = useState<SelectedModifiers>({});
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    if (selectedMenuItem) {
      setActiveModifiers({});
      setItemQuantity(1);
    }
  }, [selectedMenuItem]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const table = params.get("table") || params.get("t");
      if (table) {
        setTableNumber(table);
        setIsTableLocked(true);
      }

      const trackId = params.get("track");
      const storageKey = `menuqr_active_orders_${restaurant.id}`;
      try {
        let ids = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (trackId && !ids.includes(trackId)) {
          ids.push(trackId);
          localStorage.setItem(storageKey, JSON.stringify(ids));
          
          // Clean URL parameters by replacing state without track
          const newParams = new URLSearchParams(window.location.search);
          newParams.delete("track");
          const queryStr = newParams.toString();
          const newUrl = window.location.pathname + (queryStr ? `?${queryStr}` : '');
          window.history.replaceState({}, '', newUrl);
        }
        setActiveOrderIds(ids);
      } catch (e) { }
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
      setOrderType("dine_in");
    }
  };

  const handleDirectOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Silakan masukkan nama Anda terlebih dahulu");
      return;
    }

    if (orderType === "dine_in" && !tableNumber?.trim()) {
      toast.error("Silakan masukkan nomor meja Anda");
      return;
    }

    setIsSubmittingOrder(true);
    const toastId = toast.loading("Mengirimkan pesanan Anda...");
    try {
      const orderItems = Object.entries(cart).map(([cartKey, cartItem]) => {
        const item = items.find((i) => i.id === cartItem.itemId);
        
        // Format selectedModifiers array for orders DB
        const selectedModifiersList = Object.values(cartItem.selectedModifiers).map((g) => ({
          groupName: g.groupName,
          options: g.options.map((o) => ({
            name: o.name,
            price: o.price,
          })),
        }));

        // Calculate item price with modifiers
        let modifierExtra = 0;
        selectedModifiersList.forEach((group) => {
          group.options.forEach((opt) => {
            modifierExtra += opt.price;
          });
        });
        const finalPrice = String(Number(item?.price || 0) + modifierExtra);

        return {
          menuItemId: cartItem.itemId,
          name: item?.name || "Item",
          price: finalPrice,
          quantity: cartItem.quantity,
          selectedModifiers: selectedModifiersList,
        };
      });

      const res = await createOrderAction(restaurant.id, {
        tableNumber: orderType === "dine_in" ? (tableNumber || undefined) : undefined,
        customerName: customerName.trim(),
        orderType: orderType,
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
        } catch (e) { }
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

  const hasModifiers = (item: MenuItem) => {
    return !!(item.modifiers && item.modifiers.length > 0);
  };

  const updateQuantitySimple = (itemId: string, delta: number) => {
    const cartKey = `${itemId}_${JSON.stringify({})}`;
    setCart((prev) => {
      const existing = prev[cartKey];
      if (!existing) {
        if (delta <= 0) return prev;
        return {
          ...prev,
          [cartKey]: {
            itemId,
            quantity: delta,
            selectedModifiers: {},
          },
        };
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[cartKey];
        return copy;
      }
      return {
        ...prev,
        [cartKey]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const getSimpleItemQty = (itemId: string) => {
    return cart[`${itemId}_${JSON.stringify({})}`]?.quantity || 0;
  };

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return Object.values(cart).reduce((sum, cartItem) => {
      const item = items.find((i) => i.id === cartItem.itemId);
      if (!item) return sum;
      
      let modifierExtra = 0;
      Object.values(cartItem.selectedModifiers).forEach((group) => {
        group.options.forEach((opt) => {
          modifierExtra += opt.price;
        });
      });

      return sum + (Number(item.price) + modifierExtra) * cartItem.quantity;
    }, 0);
  }, [cart, items]);

  const isModifierSelectionValid = useMemo(() => {
    if (!selectedMenuItem || !selectedMenuItem.modifiers) return true;
    for (const group of selectedMenuItem.modifiers) {
      if (group.required) {
        const selection = activeModifiers[group.id];
        const minSel = group.minSelection || 1;
        if (!selection || selection.options.length < minSel) {
          return false;
        }
      }
    }
    return true;
  }, [selectedMenuItem, activeModifiers]);

  const modalItemTotalPrice = useMemo(() => {
    if (!selectedMenuItem) return 0;
    let basePrice = Number(selectedMenuItem.price);
    let modifierExtra = 0;
    Object.values(activeModifiers).forEach((group) => {
      group.options.forEach((opt) => {
        modifierExtra += opt.price;
      });
    });
    return basePrice + modifierExtra;
  }, [selectedMenuItem, activeModifiers]);

  const handleAddToCartFromModal = () => {
    if (!selectedMenuItem) return;
    
    const cartKey = `${selectedMenuItem.id}_${JSON.stringify(activeModifiers)}`;
    
    setCart((prev) => {
      const existing = prev[cartKey];
      if (existing) {
        return {
          ...prev,
          [cartKey]: {
            ...existing,
            quantity: existing.quantity + itemQuantity,
          },
        };
      }
      return {
        ...prev,
        [cartKey]: {
          itemId: selectedMenuItem.id,
          quantity: itemQuantity,
          selectedModifiers: activeModifiers,
        },
      };
    });

    setSelectedMenuItem(null);
    toast.success(`${selectedMenuItem.name} ditambahkan ke keranjang`);
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Generate WhatsApp text and redirect
  const handleSendOrder = async () => {
    if (!restaurant.whatsappNumber) return;

    if (orderType === "dine_in" && !tableNumber?.trim()) {
      toast.error("Silakan masukkan nomor meja Anda");
      return;
    }

    setIsSubmittingOrder(true);
    const toastId = toast.loading("Menyiapkan pesanan dan menghubungkan ke WhatsApp...");

    const orderItems = Object.entries(cart).map(([cartKey, cartItem]) => {
      const item = items.find((i) => i.id === cartItem.itemId);
      
      const selectedModifiersList = Object.values(cartItem.selectedModifiers).map((g) => ({
        groupName: g.groupName,
        options: g.options.map((o) => ({
          name: o.name,
          price: o.price,
        })),
      }));

      // Calculate final price
      let modifierExtra = 0;
      selectedModifiersList.forEach((group) => {
        group.options.forEach((opt) => {
          modifierExtra += opt.price;
        });
      });
      const finalPrice = String(Number(item?.price || 0) + modifierExtra);

      return {
        menuItemId: cartItem.itemId,
        name: item?.name || "Item",
        price: finalPrice,
        quantity: cartItem.quantity,
        selectedModifiers: selectedModifiersList,
      };
    });

    let orderId: string | undefined;

    try {
      const res = await createOrderAction(restaurant.id, {
        tableNumber: orderType === "dine_in" ? (tableNumber || undefined) : undefined,
        customerName: customerName.trim() || "Pelanggan via WA",
        orderType: orderType,
        items: orderItems,
      });

      if (res.data?.id) {
        orderId = res.data.id;
        const storageKey = `menuqr_active_orders_${restaurant.id}`;
        let currentActive = [];
        try {
          currentActive = JSON.parse(localStorage.getItem(storageKey) || "[]");
        } catch (e) { }
        currentActive.push(orderId);
        localStorage.setItem(storageKey, JSON.stringify(currentActive));
        setActiveOrderIds(currentActive);
      }
    } catch (e) {
      console.error("Gagal menyimpan pesanan untuk pelacakan:", e);
    }

    const hasTable = !!tableNumber;

    let message = `Halo *${restaurant.name}*,\n`;
    const typeStr = orderType === "dine_in" ? "Makan di tempat" : "Bungkus (Takeaway)";
    
    if (hasTable && orderType === "dine_in") {
      message += `Penyajian: *${typeStr} (MEJA ${tableNumber})*\n`;
    } else {
      message += `Penyajian: *${typeStr}*\n`;
    }

    if (customerName.trim()) {
      message += `Nama Pelanggan: *${customerName.trim()}*\n`;
    }

    if (orderId) {
      message += `ID Pesanan: *#${orderId.slice(-6).toUpperCase()}*\n`;
    }
    
    message += `\n`;

    Object.entries(cart).forEach(([cartKey, cartItem]) => {
      const item = items.find((i) => i.id === cartItem.itemId);
      if (item) {
        // Calculate item total price with modifiers
        let modifierExtra = 0;
        Object.values(cartItem.selectedModifiers).forEach((group) => {
          group.options.forEach((opt) => {
            modifierExtra += opt.price;
          });
        });
        const unitPrice = Number(item.price) + modifierExtra;
        const totalItemPrice = unitPrice * cartItem.quantity;

        message += `*${cartItem.quantity}x* ${item.name} (${formatPrice(totalItemPrice)})\n`;
        
        // Add modifier list to WhatsApp text
        Object.values(cartItem.selectedModifiers).forEach((g) => {
          const optsText = g.options.map(opt => `${opt.name}${opt.price > 0 ? ` (+Rp ${opt.price.toLocaleString("id-ID")})` : ""}`).join(", ");
          message += `   - _${g.groupName}: ${optsText}_\n`;
        });
      }
    });

    message += `\n*Total: ${formatPrice(totalPrice)}*\n\n`;

    if (orderId) {
      const trackUrl = `${window.location.origin}/r/${restaurant.slug}?track=${orderId}`;
      message += `Lacak status pesanan secara real-time di sini:\n${trackUrl}\n\n`;
    }

    message += `Terima kasih!`;

    setCart({}); // clear cart
    toast.success("Membuka WhatsApp...", { id: toastId });
    setIsCartOpen(false);
    setIsSubmittingOrder(false);

    const cleanPhone = restaurant.whatsappNumber.replace(/\D/g, "");
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div
      className="w-full mx-auto flex min-h-screen max-w-md flex-col bg-neutral-50 dark:bg-neutral-950 pb-28 shadow-xl relative border-x border-neutral-200/20 dark:border-neutral-800/40"
      style={{ "--theme-primary": restaurant.themePrimaryColor || "#f97316" } as React.CSSProperties}
    >
      {/* Cover Image */}
      <div className="relative h-60 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        {restaurant.coverUrl ? (
          <Image
            src={restaurant.coverUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(to right, ${restaurant.themePrimaryColor || "#f97316"}, #f59e0b)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-black/35 z-10" />
      </div>

      {/* Floating Restaurant Card */}
      <div className="relative px-4 -mt-16 z-20">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-xl border border-neutral-100/70 dark:border-neutral-800/80 backdrop-blur-md bg-white/95 dark:bg-neutral-900/95">
          <div className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-neutral-100 dark:border-neutral-850 bg-white">
              {restaurant.logoUrl ? (
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-white font-extrabold text-lg"
                  style={{ backgroundColor: restaurant.themePrimaryColor || "#f97316" }}
                >
                  {restaurant.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-base font-black text-neutral-900 dark:text-white leading-tight truncate">
                  {restaurant.name}
                </h1>
                {tableNumber && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-[10px] font-black tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                    Meja {tableNumber}
                  </span>
                )}
              </div>
              {restaurant.address && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                  <MapPin className="h-3 w-3 shrink-0 text-neutral-405" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
              )}
              {restaurant.description && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium mt-2 border-t border-neutral-100 dark:border-neutral-800/60 pt-2 line-clamp-2">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter & Search */}
      <div className="sticky top-0 z-30 bg-neutral-50/95 dark:bg-neutral-950/95 px-4 py-3.5 backdrop-blur-md border-b border-neutral-200/30 dark:border-neutral-900/60 space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Cari makanan atau minuman..."
            className="pl-10 pr-4 h-10 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${selectedCategory === "all"
                ? "bg-[var(--theme-primary)] text-white shadow-md"
                : "bg-white dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800"
              }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${selectedCategory === cat
                  ? "bg-[var(--theme-primary)] text-white shadow-md"
                  : "bg-white dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items container */}
      <div className="mt-4 flex-1 space-y-7">
        {/* Featured Section (Chef Recommendations Slider) */}
        {featuredItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
                <h2 className="text-xs font-extrabold text-neutral-900 dark:text-white tracking-tight uppercase">Rekomendasi</h2>
              </div>
              <span className="text-[10px] font-bold text-neutral-400">{featuredItems.length} menu</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 px-4">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.available && setSelectedMenuItem(item)}
                  className={`w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100/80 dark:border-neutral-850 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${
                    !item.available ? "opacity-60" : ""
                  }`}
                >
                  <div className="relative h-28 w-full bg-neutral-100 dark:bg-neutral-800">
                    {/* Animated Star Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 bg-amber-400 text-neutral-950 p-1 rounded-full shadow-md animate-bounce">
                      <Star className="h-2.5 w-2.5 fill-current" />
                    </div>

                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-850 dark:to-neutral-900">
                        <Utensils className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-red-500 text-[9px] font-black uppercase text-white tracking-wider">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight line-clamp-1">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 line-clamp-1 font-medium leading-normal">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs font-black text-[var(--theme-primary)]">
                        {formatPrice(Number(item.price))}
                      </span>
                      {item.available && (
                        hasModifiers(item) ? (
                          <button
                            onClick={() => setSelectedMenuItem(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-[10px] font-black hover:bg-[var(--theme-primary)]/20 transition-all active:scale-95 shadow-sm"
                          >
                            <Plus className="h-3 w-3" />
                            Sesuaikan
                          </button>
                        ) : (
                          getSimpleItemQty(item.id) > 0 ? (
                            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-full p-0.5 border border-neutral-150 dark:border-neutral-750">
                              <button
                                onClick={() => updateQuantitySimple(item.id, -1)}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shadow-sm"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="text-[10px] font-black w-4 text-center">{getSimpleItemQty(item.id)}</span>
                              <button
                                onClick={() => updateQuantitySimple(item.id, 1)}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-sm"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateQuantitySimple(item.id, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Items Grouped by Category */}
        <div className="px-4 space-y-7 pb-6 flex-1">
          {Object.entries(groupedItems).map(([catName, catItems]) => (
            <div key={catName} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-1 rounded-full bg-[var(--theme-primary)]" />
                <h3 className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  {catName}
                </h3>
              </div>
              
              <div className="grid gap-3.5">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.available && setSelectedMenuItem(item)}
                    className={`flex gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-100/70 dark:border-neutral-850 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${
                      !item.available ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 pr-1">
                      <div>
                        <h4 className="text-xs font-extrabold text-neutral-900 dark:text-white leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-black text-[var(--theme-primary)]">
                          {formatPrice(Number(item.price))}
                        </span>
                        
                        {item.available && (
                          hasModifiers(item) ? (
                            <button
                              onClick={() => setSelectedMenuItem(item)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-[10px] font-black hover:bg-[var(--theme-primary)]/20 transition-all active:scale-95 shadow-sm"
                            >
                              <Plus className="h-3 w-3" />
                              Sesuaikan
                            </button>
                          ) : (
                            getSimpleItemQty(item.id) > 0 ? (
                              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-full p-0.5 border border-neutral-150 dark:border-neutral-750">
                                <button
                                  onClick={() => updateQuantitySimple(item.id, -1)}
                                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shadow-sm"
                                >
                                  <Minus className="h-2.5 w-2.5" />
                                </button>
                                <span className="text-[10px] font-black w-4 text-center">{getSimpleItemQty(item.id)}</span>
                                <button
                                  onClick={() => updateQuantitySimple(item.id, 1)}
                                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-sm"
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => updateQuantitySimple(item.id, 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-[10px] font-black hover:bg-[var(--theme-primary)]/20 transition-all active:scale-95 shadow-sm"
                              >
                                <Plus className="h-3 w-3" />
                                Tambah
                              </button>
                            )
                          )
                        )}
                      </div>
                    </div>
                    
                    {item.imageUrl && (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className={`object-cover ${!item.available ? "grayscale" : ""}`}
                        />
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-[8px] font-black uppercase text-white tracking-wider">
                              Habis
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

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
            className="flex w-full items-center justify-between rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: restaurant.themePrimaryColor || "#f97316" }}
              >
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
            <div className="flex items-center gap-1 text-xs font-bold text-[var(--theme-primary)]">
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
                  {orderType === "dine_in" && tableNumber && (restaurant.plan === "basic" || restaurant.plan === "pro") ? (
                    <span> Pesanan akan diantarkan langsung ke <strong>Meja {tableNumber}</strong>.</span>
                  ) : orderType === "takeaway" && (restaurant.plan === "basic" || restaurant.plan === "pro") ? (
                    <span> Silakan ambil pesanan Anda di kasir jika sudah siap.</span>
                  ) : null}
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
                  <ShoppingBag className="h-4 w-4 text-[var(--theme-primary)]" />
                  Detail Pesanan
                </DialogTitle>
                {tableNumber && (
                  <p className="text-[10px] font-bold text-neutral-400 text-left mt-0.5">
                    Ditempatkan di: <span className="text-[var(--theme-primary)] font-extrabold uppercase">Meja {tableNumber}</span>
                  </p>
                )}
              </DialogHeader>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[40vh] overflow-y-auto pr-1">
                {Object.entries(cart).map(([cartKey, cartItem]) => {
                  const item = items.find((i) => i.id === cartItem.itemId);
                  if (!item) return null;
                  
                  // Calculate item price with modifiers
                  let modifierExtra = 0;
                  Object.values(cartItem.selectedModifiers).forEach((group) => {
                    group.options.forEach((opt) => {
                      modifierExtra += opt.price;
                    });
                  });
                  const itemPrice = Number(item.price) + modifierExtra;

                  const updateCartItemQty = (delta: number) => {
                    setCart((prev) => {
                      const existing = prev[cartKey];
                      if (!existing) return prev;
                      const nextQty = existing.quantity + delta;
                      if (nextQty <= 0) {
                        const copy = { ...prev };
                        delete copy[cartKey];
                        return copy;
                      }
                      return {
                        ...prev,
                        [cartKey]: {
                          ...existing,
                          quantity: nextQty,
                        },
                      };
                    });
                  };

                  return (
                    <div key={cartKey} className="py-3 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-[var(--theme-primary)] font-black mt-0.5">{formatPrice(itemPrice)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItemQty(-1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="text-xs font-extrabold w-4 text-center">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateCartItemQty(1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white hover:opacity-90"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Render modifiers if present */}
                      {Object.values(cartItem.selectedModifiers).length > 0 && (
                        <div className="pl-2 space-y-0.5 border-l-2 border-neutral-100 dark:border-neutral-800">
                          {Object.values(cartItem.selectedModifiers).map((modGroup, idx) => (
                            <div key={idx} className="text-[9px] text-neutral-400 dark:text-neutral-500">
                              <span className="font-semibold">{modGroup.groupName}:</span>{" "}
                              {modGroup.options.map(opt => `${opt.name}${opt.price > 0 ? ` (+Rp ${opt.price.toLocaleString("id-ID")})` : ""}`).join(", ")}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

                <div className="space-y-3.5 pt-1">
                  {/* Makan di Tempat / Bungkus Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      Pilihan Penyajian
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setOrderType("dine_in")}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                          orderType === "dine_in"
                            ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        Makan di Tempat
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType("takeaway")}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                          orderType === "takeaway"
                            ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        Bungkus
                      </button>
                    </div>
                  </div>

                  {/* Table Number Field (Only if Dine-in) */}
                  {orderType === "dine_in" && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        Nomor Meja
                      </label>
                      <Input
                        type="text"
                        placeholder="Contoh: Meja A12"
                        value={tableNumber || ""}
                        onChange={(e) => !isTableLocked && setTableNumber(e.target.value)}
                        disabled={isTableLocked}
                        className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500 disabled:opacity-85 disabled:bg-neutral-50 dark:disabled:bg-neutral-950"
                      />
                    </div>
                  )}

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      Nama Anda
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama Anda..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500"
                    />
                  </div>

                  {/* Submit Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    {(restaurant.plan === "basic" || restaurant.plan === "pro") ? (
                      <>
                        <Button
                          onClick={handleDirectOrder}
                          disabled={isSubmittingOrder || !customerName.trim() || (orderType === "dine_in" && !tableNumber?.trim())}
                          className="w-full bg-[var(--theme-primary)] hover:opacity-90 text-white rounded-xl py-5 text-xs font-black shadow-md flex items-center justify-center gap-2"
                        >
                          Pesan Langsung (POS)
                        </Button>

                        {restaurant.whatsappNumber && (
                          <button
                            onClick={handleSendOrder}
                            disabled={isSubmittingOrder || !customerName.trim() || (orderType === "dine_in" && !tableNumber?.trim())}
                            className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex items-center justify-center gap-1 mt-1 py-1"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                            Atau Kirim via WhatsApp
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {restaurant.whatsappNumber ? (
                          <Button
                            onClick={handleSendOrder}
                            disabled={isSubmittingOrder || !customerName.trim() || (orderType === "dine_in" && !tableNumber?.trim())}
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--theme-primary)] hover:opacity-90 text-white shadow-xl hover:scale-105 active:scale-95 transition-all relative border border-[var(--theme-primary)]"
            title="Lacak Pesanan"
          >
            <ClipboardList className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-[10px] font-black text-white dark:text-neutral-900 ring-2 ring-[var(--theme-primary)]">
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
              <ClipboardList className="h-4 w-4 text-[var(--theme-primary)]" />
              Lacak Pesanan
            </DialogTitle>
          </DialogHeader>

          {trackingLoading && trackingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--theme-primary)]" />
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
                          <span className="absolute -left-[27px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black text-white bg-[var(--theme-primary)]">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <div className="pl-1.5">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Diterima</h4>
                            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1">Pesanan masuk ke sistem antrean</p>
                          </div>
                        </div>

                        {/* Step 2: Cooking */}
                        <div className="relative">
                          <span className={`absolute -left-[27px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black text-white ${currentStep >= 1 ? "bg-[var(--theme-primary)]" : "bg-neutral-200 dark:bg-neutral-800"
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
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Sedang Dibuat</h4>
                            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">Chef sedang menyiapkan hidangan Anda</p>
                          </div>
                        </div>

                        {/* Step 3: Served */}
                        <div className="relative">
                          <span className={`absolute -left-[27px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black text-white ${currentStep >= 2 ? "bg-green-500" : "bg-neutral-200 dark:bg-neutral-800"
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
                        <span className="text-[var(--theme-primary)]">{formatPrice(Number(order.totalPrice))}</span>
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

      {/* Food Detail Modal */}
      <Dialog open={!!selectedMenuItem} onOpenChange={(open) => !open && setSelectedMenuItem(null)}>
        <DialogContent className="max-w-xs rounded-3xl p-0 overflow-hidden gap-0 border-none bg-white dark:bg-neutral-900">
          {selectedMenuItem && (
            <div className="flex flex-col">
              <div className="relative h-56 w-full bg-neutral-100 dark:bg-neutral-800">
                {selectedMenuItem.imageUrl ? (
                  <Image src={selectedMenuItem.imageUrl} alt={selectedMenuItem.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                    <Utensils className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedMenuItem(null)}
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-tight">
                      {selectedMenuItem.name}
                    </h3>
                    <span className="text-xs font-black text-[var(--theme-primary)] shrink-0">
                      {formatPrice(Number(selectedMenuItem.price))}
                    </span>
                  </div>
                  {selectedMenuItem.categoryName && (
                    <span className="inline-block text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {selectedMenuItem.categoryName}
                    </span>
                  )}
                </div>
                
                {selectedMenuItem.description && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                    {selectedMenuItem.description}
                  </p>
                )}
                
                {/* Modifier Groups */}
                {selectedMenuItem.modifiers && selectedMenuItem.modifiers.length > 0 && (
                  <div className="py-3 space-y-4 max-h-[30vh] overflow-y-auto border-t border-neutral-100 dark:border-neutral-850">
                    {selectedMenuItem.modifiers.map((group: any) => {
                      const isRequired = group.required;
                      const maxSel = group.maxSelection || 1;
                      const minSel = group.minSelection || 0;
                      const selectedOptions = activeModifiers[group.id]?.options || [];

                      return (
                        <div key={group.id} className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
                              {group.name}
                              {isRequired && <span className="text-red-500 ml-0.5 font-black">*</span>}
                            </h4>
                            <span className="text-[9px] text-neutral-450 font-bold">
                              {isRequired ? "Wajib" : "Opsional"}
                              {maxSel > 1 ? ` (maks ${maxSel})` : " (pilih 1)"}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {group.options.map((option: any, optIdx: number) => {
                              const isChecked = selectedOptions.some(o => o.name === option.name);

                              const handleOptionSelect = () => {
                                setActiveModifiers((prev) => {
                                  const currentGroup = prev[group.id] || { groupName: group.name, options: [] };
                                  let newOptions = [...currentGroup.options];

                                  if (isChecked) {
                                    newOptions = newOptions.filter(o => o.name !== option.name);
                                  } else {
                                    if (maxSel === 1) {
                                      newOptions = [{ name: option.name, price: Number(option.price) }];
                                    } else if (newOptions.length < maxSel) {
                                      newOptions.push({ name: option.name, price: Number(option.price) });
                                    } else {
                                      newOptions.shift();
                                      newOptions.push({ name: option.name, price: Number(option.price) });
                                    }
                                  }

                                  const updated = { ...prev };
                                  if (newOptions.length === 0) {
                                    delete updated[group.id];
                                  } else {
                                    updated[group.id] = {
                                      groupName: group.name,
                                      options: newOptions,
                                    };
                                  }
                                  return updated;
                                });
                              };

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={handleOptionSelect}
                                  className={`flex w-full items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                                    isChecked
                                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 dark:bg-[var(--theme-primary)]/10"
                                      : "border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                                  }`}
                                >
                                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-350">
                                    {option.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {Number(option.price) > 0 && (
                                      <span className="text-[10px] font-extrabold text-[var(--theme-primary)]">
                                        +{formatPrice(Number(option.price))}
                                      </span>
                                    )}
                                    <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                                      isChecked
                                        ? "bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white"
                                        : "border-neutral-350 dark:border-neutral-700"
                                    }`}>
                                      {isChecked && <Check className="h-3 w-3" />}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Quantity selector & Add Button */}
                <div className="pt-4 flex flex-col gap-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400">Atur Jumlah</span>
                    <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 border border-neutral-200/50 dark:border-neutral-750">
                      <button
                        type="button"
                        onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shadow-sm"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{itemQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setItemQuantity(prev => prev + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-sm"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCartFromModal}
                    disabled={!isModifierSelectionValid}
                    className="w-full bg-[var(--theme-primary)] hover:opacity-90 disabled:opacity-50 text-white rounded-xl py-5 text-xs font-black shadow-md flex items-center justify-center gap-1"
                  >
                    Tambah ke Keranjang ({formatPrice(modalItemTotalPrice * itemQuantity)})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
