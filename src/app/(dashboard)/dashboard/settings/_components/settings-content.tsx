"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  Pencil,
  Loader2,
  Globe,
  Moon,
  Sun,
  Monitor,
  Lock,
  AlertTriangle,
  Trash2,
  Bell,
  Eye,
  EyeOff,
  CreditCard,
  Download,
  Check,
  ShieldCheck,
  Building,
  Volume2,
  MailWarning,
  UtensilsCrossed,
  MapPin,
  Phone,
  Settings,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/components/ThemeProvider";
import { updateUserProfile, getLatestVerificationCode, verifyUserEmailDirectly } from "@/server/actions/user-actions";

interface SettingsContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    role?: string | null;
    phone?: string | null;
    occupation?: string | null;
    address?: string | null;
    country?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
  restaurants: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    phone?: string | null;
    address?: string | null;
    createdAt: string;
    updatedAt: string;
    subscription?: {
      id: string;
      provider?: string | null;
      externalSubscriptionId?: string | null;
      status?: string | null;
      currentPeriodStart?: string | null;
      currentPeriodEnd?: string | null;
      createdAt: string;
    } | null;
  }[];
}

const countryData: Record<string, string[]> = {
  Indonesia: [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Bali",
    "Banten",
    "DI Yogyakarta",
    "Sumatera Utara",
    "Sumatera Selatan",
    "Sumatera Barat",
    "Riau",
    "Kepulauan Riau",
    "Sulawesi Selatan",
    "Sulawesi Utara",
    "Kalimantan Timur",
    "Kalimantan Barat"
  ],
  Malaysia: [
    "Selangor",
    "Johor",
    "Penang",
    "Kuala Lumpur",
    "Perak",
    "Kedah",
    "Malacca",
    "Negeri Sembilan",
    "Pahang",
    "Sabah",
    "Sarawak"
  ],
  Singapore: [
    "Central Region",
    "East Region",
    "North Region",
    "Northeast Region",
    "West Region"
  ],
  "United States": [
    "California",
    "New York",
    "Texas",
    "Florida",
    "Washington",
    "Illinois",
    "Massachusetts"
  ]
};

const settingsTranslations = {
  id: {
    pageTitle: "Pengaturan Akun",
    pageSubtitle: "Kelola informasi profil, preferensi, keamanan, dan tagihan Anda.",
    
    // Sidebar Tabs
    tabMyProfile: "Profil Saya",
    tabPasswordSecurity: "Kata Sandi & Keamanan",
    tabNotifications: "Notifikasi",
    tabBilling: "Tagihan & Plan",
    tabDataExport: "Ekspor Data",
    tabDeleteAccount: "Hapus Akun",
    
    // Section Headers & Titles
    personalInfoTitle: "Informasi Pribadi",
    addressTitle: "Alamat",
    myProfileTitle: "Profil Saya",
    editBtn: "Edit",
    save: "Simpan",
    saving: "Menyimpan...",
    cancel: "Batal",
    
    // Fields
    firstName: "Nama Depan",
    lastName: "Nama Belakang",
    emailAddress: "Alamat Email",
    phoneNumber: "Nomor Telepon",
    bio: "Pekerjaan",
    fullAddress: "Alamat Lengkap",
    country: "Negara",
    province: "Provinsi",
    postalCode: "Kode Pos",
    
    // Profile Additional Info
    accountOwner: "Pemilik Akun",
    verified: "Terverifikasi",
    unverified: "Belum Terverifikasi",
    memberSince: "Anggota Sejak",
    lastUpdated: "Terakhir Diperbarui",
    
    // Preferences
    preferencesTitle: "Preferensi Tampilan",
    language: "Bahasa",
    languageDesc: "Pilih bahasa tampilan antarmuka.",
    themeSetting: "Tema Tampilan",
    themeDesc: "Pilih mode terang atau gelap.",
    lightMode: "Terang",
    darkMode: "Gelap",
    systemMode: "Sistem",
    
    // Password & Security
    securityTitle: "Keamanan Akun",
    securityDesc: "Kelola kata sandi dan metode autentikasi Anda.",
    changePassword: "Ubah Kata Sandi",
    changePasswordDesc: "Ganti kata sandi akun Anda secara berkala untuk menjaga keamanan.",
    currentPassword: "Kata Sandi Saat Ini",
    newPassword: "Kata Sandi Baru",
    confirmPassword: "Konfirmasi Kata Sandi Baru",
    passwordMinLength: "Minimal 8 karakter",
    passwordMismatch: "Kata sandi tidak cocok",
    passwordChanged: "Kata sandi berhasil diubah!",
    passwordChangeError: "Gagal mengubah kata sandi. Periksa kembali kata sandi saat ini.",
    showPassword: "Tampilkan",
    hidePassword: "Sembunyikan",
    emailVerification: "Verifikasi Email",
    emailVerifiedMsg: "Email Anda telah terverifikasi.",
    emailUnverifiedMsg: "Silakan verifikasi alamat email Anda untuk mengamankan akun.",
    activeStatus: "Aktif",
    pendingStatus: "Tertunda",
    twoFactor: "Autentikasi Dua Faktor (2FA)",
    extraLayer: "Tambahkan lapisan keamanan ekstra ke akun Anda.",
    comingSoon: "Segera Hadir",
    
    // Notifications
    notificationTitle: "Pengaturan Notifikasi",
    notificationDesc: "Pilih kapan dan bagaimana Anda ingin menerima notifikasi.",
    orderSound: "Bunyi Notifikasi Pesanan Masuk (POS)",
    orderSoundDesc: "Mainkan suara 'ping' nyaring real-time saat ada pesanan baru.",
    emailReceipt: "Resi Email Harian",
    emailReceiptDesc: "Terima ringkasan transaksi harian di email Anda.",
    marketingEmail: "Email Pemasaran & Edukasi",
    marketingEmailDesc: "Dapatkan tips bisnis kuliner dan informasi fitur baru.",
    
    // Billing
    billingTitle: "Status Langganan & Tagihan",
    billingDesc: "Lihat plan saat ini, detail pembayaran, dan riwayat invoice.",
    currentPlan: "Plan Aktif",
    upgradeBtn: "Upgrade Plan",
    invoiceHistory: "Riwayat Invoice",
    invoiceDate: "Tanggal",
    invoiceAmount: "Jumlah",
    invoiceStatus: "Status",
    paid: "Lunas",
    
    // Data Export
    exportTitle: "Ekspor Data Akun",
    exportDesc: "Unduh semua data outlet, menu, dan riwayat transaksi Anda.",
    exportMenu: "Ekspor Menu Makanan",
    exportMenuDesc: "Unduh daftar hidangan dan harga dalam format CSV atau JSON.",
    exportOrders: "Ekspor Transaksi",
    exportOrdersDesc: "Unduh riwayat pesanan pelanggan dalam format CSV.",
    downloadCsv: "Unduh CSV",
    downloadJson: "Unduh JSON",
    
    // Danger Zone
    dangerZoneTitle: "Zona Bahaya",
    dangerZoneDesc: "Tindakan ireversibel yang perlu perhatian khusus.",
    deleteAccount: "Hapus Akun Permanen",
    deleteAccountDesc: "Menghapus akun akan menghapus semua data restoran, menu, dan QR code Anda secara permanen. Tindakan ini tidak dapat dibatalkan.",
    deleteAccountBtn: "Hapus Akun Saya",
    deleteConfirmTitle: "Konfirmasi Penghapusan Akun",
    deleteConfirmDesc: "Ketik nama akun Anda ({name}) untuk mengonfirmasi:",
    deleteConfirmPlaceholder: "Ketik nama akun...",
    deleteFinalBtn: "Ya, Hapus Akun Saya",
    deleting: "Menghapus...",
    nameUpdated: "Profil berhasil diperbarui!",
    somethingWrong: "Terjadi kesalahan",
    typeNameToDelete: "Nama akun tidak cocok",

    // Dialog & Button fixes
    editProfileTitle: "Edit Detail Profil",
    editPersonalInfoTitle: "Edit Informasi Pribadi",
    editAddressTitle: "Edit Alamat",
    changePasswordBtn: "Ubah Kata Sandi",

    // Missing DB Notice
    noData: "Belum ada data",
    invoiceNote: "Catatan: Informasi tagihan dan invoice diambil secara real-time dari database.",
    notificationNote: "Pengaturan notifikasi disimpan secara lokal di browser Anda."
  },
  en: {
    pageTitle: "Account Settings",
    pageSubtitle: "Manage your profile information, preferences, security, and billing.",
    
    // Sidebar Tabs
    tabMyProfile: "My Profile",
    tabPasswordSecurity: "Password & Security",
    tabNotifications: "Notifications",
    tabBilling: "Billing",
    tabDataExport: "Data Export",
    tabDeleteAccount: "Delete Account",
    
    // Section Headers & Titles
    personalInfoTitle: "Personal Information",
    addressTitle: "Address",
    myProfileTitle: "My Profile",
    editBtn: "Edit",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    
    // Fields
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone",
    bio: "Occupation",
    fullAddress: "Full Address",
    country: "Country",
    province: "Province/State",
    postalCode: "Postal Code",
    
    // Profile Additional Info
    accountOwner: "Account Owner",
    verified: "Verified",
    unverified: "Unverified",
    memberSince: "Member Since",
    lastUpdated: "Last Updated",
    
    // Preferences
    preferencesTitle: "Preferences",
    language: "Language",
    languageDesc: "Select your interface language.",
    themeSetting: "Theme",
    themeDesc: "Select light or dark mode.",
    lightMode: "Light",
    darkMode: "Dark",
    systemMode: "System",
    
    // Password & Security
    securityTitle: "Account Security",
    securityDesc: "Manage your password and authentication methods.",
    changePassword: "Change Password",
    changePasswordDesc: "Update your account password periodically to ensure security.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordMinLength: "Minimum 8 characters",
    passwordMismatch: "Passwords do not match",
    passwordChanged: "Password changed successfully!",
    passwordChangeError: "Failed to change password. Please check your current password.",
    showPassword: "Show",
    hidePassword: "Hide",
    emailVerification: "Email Verification",
    emailVerifiedMsg: "Your email has been verified.",
    emailUnverifiedMsg: "Please verify your email address to secure your account.",
    activeStatus: "Active",
    pendingStatus: "Pending",
    twoFactor: "Two-Factor Authentication (2FA)",
    extraLayer: "Add an extra layer of security to your account.",
    comingSoon: "Coming Soon",
    
    // Notifications
    notificationTitle: "Notification Settings",
    notificationDesc: "Choose when and how you want to receive alerts.",
    orderSound: "Order Sound Notifications (POS)",
    orderSoundDesc: "Play a loud 'ping' sound in real-time when new orders arrive.",
    emailReceipt: "Daily Email Reports",
    emailReceiptDesc: "Receive a daily summary of your transactions.",
    marketingEmail: "Marketing & Education Emails",
    marketingEmailDesc: "Get business tips and updates on new platform features.",
    
    // Billing
    billingTitle: "Subscription Status & Billing",
    billingDesc: "View your current plan, payment details, and invoice history.",
    currentPlan: "Current Plan",
    upgradeBtn: "Upgrade Plan",
    invoiceHistory: "Invoice History",
    invoiceDate: "Date",
    invoiceAmount: "Amount",
    invoiceStatus: "Status",
    paid: "Paid",
    
    // Data Export
    exportTitle: "Export Account Data",
    exportDesc: "Download all your outlet, menu, and transaction history.",
    exportMenu: "Export Menu Items",
    exportMenuDesc: "Download your food items list and prices in CSV or JSON formats.",
    exportOrders: "Export Transactions",
    exportOrdersDesc: "Download customer order histories in CSV format.",
    downloadCsv: "Download CSV",
    downloadJson: "Download JSON",
    
    // Danger Zone
    dangerZoneTitle: "Danger Zone",
    dangerZoneDesc: "Irreversible actions that require special attention.",
    deleteAccount: "Delete Account Permanently",
    deleteAccountDesc: "Deleting your account will permanently remove all restaurant data, menus, and QR codes. This action cannot be undone.",
    deleteAccountBtn: "Delete My Account",
    deleteConfirmTitle: "Confirm Account Deletion",
    deleteConfirmDesc: "Type your account name ({name}) to confirm:",
    deleteConfirmPlaceholder: "Type account name...",
    deleteFinalBtn: "Yes, Delete My Account",
    deleting: "Deleting...",
    nameUpdated: "Profile updated successfully!",
    somethingWrong: "Something went wrong",
    typeNameToDelete: "Account name does not match",

    // Dialog & Button fixes
    editProfileTitle: "Edit Profile Details",
    editPersonalInfoTitle: "Edit Personal Information",
    editAddressTitle: "Edit Address",
    changePasswordBtn: "Change Password",

    // Missing DB Notice
    noData: "No data",
    invoiceNote: "Note: Billing and invoices are pulled in real-time directly from the database.",
    notificationNote: "Notification settings are saved locally in your browser."
  }
};

function ToggleSwitch({
  checked,
  onChange,
  label,
  desc,
  icon: Icon
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  desc: string;
  icon: any;
}) {
  return (
    <div className="flex items-start justify-between gap-6 p-5 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-100/60 dark:border-neutral-800/40 hover:border-orange-500/20 dark:hover:border-orange-500/10 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/10">
          <Icon className="h-5 w-5 text-orange-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-neutral-900 dark:text-white block cursor-pointer select-none">
            {label}
          </label>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed block">
            {desc}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500/20 shrink-0 ${
          checked ? "bg-orange-500" : "bg-neutral-200 dark:bg-neutral-800"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsContent({ user, restaurants }: SettingsContentProps) {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  // Dialog Open States
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPersonalInfoOpen, setEditPersonalInfoOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const [saving, setSaving] = useState(false);
  
  // Dynamic Profile States (strictly DB data)
  const [displayName, setDisplayName] = useState(user.name);
  const [userRole, setUserRole] = useState(user.role || "");
  const [userLocation, setUserLocation] = useState("");
  
  // Personal Info Inputs (strictly DB data)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.occupation || "");
  
  // Address Inputs (strictly DB data)
  const [address, setAddress] = useState(user.address || "");
  const [country, setCountry] = useState(user.country || "");
  const [province, setProvince] = useState(user.province || "");
  const [postalCode, setPostalCode] = useState(user.postalCode || "");
  
  // Form Temp States (for Dialog edits)
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempBio, setTempBio] = useState("");
  
  const [tempAddress, setTempAddress] = useState("");
  const [tempCountry, setTempCountry] = useState("");
  const [tempProvince, setTempProvince] = useState("");
  const [tempPostalCode, setTempPostalCode] = useState("");
  
  const [tempRole, setTempRole] = useState("");
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwError, setPwError] = useState("");
  
  // Delete States
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  
  // Notification states (loaded from local storage, client setting)
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [marketingMails, setMarketingMails] = useState(false);
  
  // Verification states
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [developerCode, setDeveloperCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Theme/Language mounting
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }

    const savedSound = localStorage.getItem("menuqr_notif_sound");
    const savedReceipt = localStorage.getItem("menuqr_notif_receipt");
    const savedMarketing = localStorage.getItem("menuqr_notif_marketing");

    if (savedSound !== null) setSoundAlerts(savedSound === "true");
    if (savedReceipt !== null) setEmailReceipts(savedReceipt === "true");
    if (savedMarketing !== null) setMarketingMails(savedMarketing === "true");
    
    const loadLang = () => {
      const currentSavedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
      if (currentSavedLang && (currentSavedLang === "id" || currentSavedLang === "en")) {
        setLang(currentSavedLang);
      }
    };
    window.addEventListener("menuqr-lang-change", loadLang);
    return () => window.removeEventListener("menuqr-lang-change", loadLang);
  }, []);

  // Split name on mount or when displayName changes
  useEffect(() => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length > 0) {
      setFirstName(parts[0]);
      setLastName(parts.slice(1).join(" "));
    }
  }, [displayName]);

  // Sync avatar location subtitle dynamically
  useEffect(() => {
    if (province && country) {
      setUserLocation(`${province}, ${country}`);
    } else {
      setUserLocation(country || province || "");
    }
  }, [province, country]);

  // Sync avatar role subtitle dynamically
  useEffect(() => {
    setUserRole(bio || user.role || "");
  }, [bio, user.role]);

  // Persist notification preferences in local storage when changed
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("menuqr_notif_sound", String(soundAlerts));
    }
  }, [soundAlerts, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("menuqr_notif_receipt", String(emailReceipts));
    }
  }, [emailReceipts, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("menuqr_notif_marketing", String(marketingMails));
    }
  }, [marketingMails, mounted]);

  const handleLangChange = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("menuqr-lang", newLang);
    window.dispatchEvent(new Event("menuqr-lang-change"));
  };

  const t = settingsTranslations[lang];

  // Save profile header (Role and Location)
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateUserProfile({
        occupation: tempRole.trim() || null,
      });

      if (res.success) {
        setUserRole(tempRole);
        setBio(tempRole);
        toast.success(t.nameUpdated);
        setEditProfileOpen(false);
      } else {
        toast.error(t.somethingWrong);
      }
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  };

  // Save personal info (First Name, Last Name, Phone, Bio)
  async function handleSavePersonalInfo() {
    const fullName = `${tempFirstName.trim()} ${tempLastName.trim()}`.trim();
    if (!fullName) return;
    
    setSaving(true);
    try {
      const [authRes, dbRes] = await Promise.all([
        authClient.updateUser({ name: fullName }),
        updateUserProfile({
          name: fullName,
          phone: tempPhone.trim() || null,
          occupation: tempBio.trim() || null,
        })
      ]);

      if (authRes.error) {
        toast.error(authRes.error.message || t.somethingWrong);
      } else if (!dbRes.success) {
        toast.error(t.somethingWrong);
      } else {
        setDisplayName(fullName);
        setFirstName(tempFirstName.trim());
        setLastName(tempLastName.trim());
        setPhone(tempPhone.trim());
        setBio(tempBio.trim());
        toast.success(t.nameUpdated);
        setEditPersonalInfoOpen(false);
      }
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  }

  // Save address information
  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      const res = await updateUserProfile({
        address: tempAddress.trim() || null,
        country: tempCountry.trim() || null,
        province: tempProvince.trim() || null,
        postalCode: tempPostalCode.trim() || null,
      });

      if (res.success) {
        setAddress(tempAddress.trim());
        setCountry(tempCountry.trim());
        setProvince(tempProvince.trim());
        setPostalCode(tempPostalCode.trim());
        toast.success(t.nameUpdated);
        setEditAddressOpen(false);
      } else {
        toast.error(t.somethingWrong);
      }
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  };

  async function handleChangePassword() {
    setPwError("");
    if (newPassword.length < 8) {
      setPwError(t.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(t.passwordMismatch);
      return;
    }
    setSaving(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) {
        setPwError(error.message || t.passwordChangeError);
      } else {
        toast.success(t.passwordChanged);
        setPasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwError(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmName !== user.name) {
      toast.error(t.typeNameToDelete);
      return;
    }
    setSaving(true);
    try {
      const { error } = await authClient.deleteUser();
      if (error) {
        toast.error(error.message || t.somethingWrong);
      } else {
        window.location.href = "/login";
      }
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  }

  // Trigger better-auth verification email creation and get code from DB
  async function handleSendVerification() {
    setSendingVerification(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: window.location.origin + "/dashboard/settings",
      });

      if (error) {
        toast.error(error.message || t.somethingWrong);
        return;
      }

      toast.success(lang === "id" ? "Email verifikasi terkirim!" : "Verification email sent!");
      setVerificationSent(true);

      // Fetch the latest generated token/code from the database
      // Delay 1.5 seconds to ensure Drizzle/Better Auth completes write operation
      setTimeout(async () => {
        try {
          const res = await getLatestVerificationCode(user.email);
          if (res.success && res.code) {
            setDeveloperCode(res.code);
          }
        } catch (e) {
          console.error("Failed to fetch dev code", e);
        }
      }, 1500);
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSendingVerification(false);
    }
  }

  // Verify code directly in the database
  async function handleVerifyCode() {
    if (!inputCode.trim()) return;
    setVerifyingEmail(true);
    try {
      const res = await verifyUserEmailDirectly(inputCode.trim());
      if (res.success) {
        toast.success(lang === "id" ? "Email Anda berhasil diverifikasi!" : "Email verified successfully!");
        setEmailVerified(true);
        setVerificationSent(false);
        setDeveloperCode("");
        setInputCode("");
      } else {
        toast.error(res.error || (lang === "id" ? "Kode verifikasi tidak valid" : "Invalid verification code"));
      }
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setVerifyingEmail(false);
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openEditProfile = () => {
    setTempRole(userRole);
    setEditProfileOpen(true);
  };

  const openEditPersonalInfo = () => {
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setTempPhone(phone);
    setTempBio(bio);
    setEditPersonalInfoOpen(true);
  };

  const openEditAddress = () => {
    setTempAddress(address);
    setTempCountry(country);
    setTempProvince(province);
    setTempPostalCode(postalCode);
    setEditAddressOpen(true);
  };

  const menuTabs = [
    { id: "profile", label: t.tabMyProfile, icon: User },
    { id: "security", label: t.tabPasswordSecurity, icon: Shield },
    { id: "notifications", label: t.tabNotifications, icon: Bell },
    { id: "billing", label: t.tabBilling, icon: CreditCard },
    { id: "data-export", label: t.tabDataExport, icon: Download },
  ];

  const tabGroups = [
    {
      title: lang === "id" ? "Profil & Keamanan" : "Profile & Security",
      items: [
        { id: "profile", label: t.tabMyProfile, icon: User },
        { id: "security", label: t.tabPasswordSecurity, icon: Shield },
      ]
    },
    {
      title: lang === "id" ? "Preferensi & Data" : "Preferences & Data",
      items: [
        { id: "notifications", label: t.tabNotifications, icon: Bell },
        { id: "billing", label: t.tabBilling, icon: CreditCard },
        { id: "data-export", label: t.tabDataExport, icon: Download },
      ]
    }
  ];

  // Dynamic DB Billing binding
  const hasRestaurant = restaurants.length > 0;
  const activeRestaurant = restaurants[0];
  const activeRestaurantName = hasRestaurant ? activeRestaurant.name : (lang === "id" ? "Belum Ada Restoran" : "No Restaurant Configured");
  const activeRestaurantPlan = hasRestaurant ? activeRestaurant.plan : "free";
  
  const activeSubscription = hasRestaurant ? activeRestaurant.subscription : null;
  const subscriptionStatus = activeSubscription?.status || (hasRestaurant ? "active (Trial)" : "free");
  
  // Format period end date from DB
  const formatPeriodEnd = (isoString?: string | null) => {
    if (!isoString) return lang === "id" ? "Selamanya" : "Lifetime";
    return new Date(isoString).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Bind invoice history table to DB subscription records
  const paymentHistory = activeSubscription ? [
    {
      id: `SUB-${activeSubscription.id.substring(0, 8).toUpperCase()}`,
      date: new Date(activeSubscription.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      amount: activeRestaurantPlan === "pro" ? "Rp 150.000" : activeRestaurantPlan === "basic" ? "Rp 50.000" : "Rp 0",
      status: activeSubscription.status || "active"
    }
  ] : [];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 animate-fade-in-up">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial-gradient from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-radial-gradient from-orange-600/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Settings className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                MenuQR Settings Console
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {t.pageTitle}
            </h1>
            <p className="text-sm text-neutral-400 font-medium">
              {t.pageSubtitle}
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 shrink-0 shadow-lg">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{t.memberSince}</span>
              <span className="text-xs font-bold text-neutral-200 mt-0.5">{formatDate(user.createdAt)}</span>
            </div>
            <div className="w-px h-8 bg-neutral-800" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{t.lastUpdated}</span>
              <span className="text-xs font-bold text-neutral-200 mt-0.5">{formatDate(user.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Responsive Layout Split */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* Mobile Category Bar (Horizontal Scrolling Tabs) */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 scrollbar-none w-full">
            {menuTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                      : "bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={() => setActiveTab("delete-account")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "delete-account"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                  : "bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t.tabDeleteAccount}
            </button>
          </div>

          {/* Desktop Left Dock */}
          <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-100 dark:border-neutral-800/80 p-5 shadow-sm space-y-6 sticky top-6">
            
            {/* Tab Groups */}
            <div className="space-y-6">
              {tabGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-600 px-3">
                    {group.title}
                  </span>
                  <div className="space-y-0.5">
                    {group.items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group/btn ${
                            isActive
                              ? "bg-orange-500/10 text-orange-500 dark:bg-orange-500/15"
                              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded-lg transition-colors ${
                              isActive 
                                ? "bg-orange-50 text-white shadow-sm" 
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover/btn:text-neutral-700 dark:group-hover/btn:text-neutral-200"
                            }`}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span>{tab.label}</span>
                          </div>
                          <ChevronRight className={`h-3 w-3 text-neutral-400 transition-transform ${isActive ? "translate-x-0.5 opacity-100" : "opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-100 dark:border-neutral-800/80 my-4" />

            {/* Preferences / Theme Controls */}
            <div className="space-y-4">
              {/* Language Switch */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-600 px-3 block">
                  {t.preferencesTitle}
                </span>
                <div className="flex gap-1 p-1 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100/50 dark:border-neutral-800/50">
                  <button 
                    onClick={() => handleLangChange("id")} 
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                      lang === "id" 
                        ? "bg-white dark:bg-neutral-800 text-orange-500 dark:text-orange-400 shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    }`}
                  >
                    Indonesian
                  </button>
                  <button 
                    onClick={() => handleLangChange("en")} 
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                      lang === "en" 
                        ? "bg-white dark:bg-neutral-800 text-orange-500 dark:text-orange-400 shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              {mounted && (
                <div className="flex gap-1 p-1 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100/50 dark:border-neutral-800/50">
                  <button 
                    onClick={() => setTheme("light")} 
                    title={t.lightMode}
                    className={`flex-1 py-1.5 rounded-lg flex justify-center items-center transition-all ${
                      theme === "light" 
                        ? "bg-white dark:bg-neutral-800 text-orange-500 dark:text-orange-400 shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setTheme("dark")} 
                    title={t.darkMode}
                    className={`flex-1 py-1.5 rounded-lg flex justify-center items-center transition-all ${
                      theme === "dark" 
                        ? "bg-white dark:bg-neutral-800 text-orange-500 dark:text-orange-400 shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setTheme("system")} 
                    title={t.systemMode}
                    className={`flex-1 py-1.5 rounded-lg flex justify-center items-center transition-all ${
                      theme === "system" 
                        ? "bg-white dark:bg-neutral-800 text-orange-500 dark:text-orange-400 shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => setActiveTab("delete-account")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "delete-account"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/5"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>{t.tabDeleteAccount}</span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. Panel Content Container */}
        <div className="flex-1 w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[28px] p-6 md:p-8 shadow-sm">
          
          {/* TAB CONTENT: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Profile Card Header */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-50 to-orange-50/20 dark:from-neutral-900 dark:to-orange-950/10 border border-neutral-100 dark:border-neutral-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-orange-500/20 dark:hover:border-orange-500/10 transition-all duration-300">
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-radial-gradient from-orange-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-5 z-10">
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-2xl p-0.5 bg-gradient-to-br from-orange-400 via-rose-500 to-indigo-500 shadow-md">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={displayName}
                          width={80}
                          height={80}
                          className="h-full w-full rounded-[14px] object-cover bg-white dark:bg-neutral-900"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-neutral-900 dark:bg-neutral-950 text-white font-extrabold text-2xl border border-neutral-800/40">
                          {displayName[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-neutral-900 shadow-md ${
                      emailVerified ? "bg-emerald-400" : "bg-amber-400"
                    }`} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">{displayName}</h2>
                      <Badge
                        className={`text-[9px] font-bold border-0 px-2.5 py-0.5 rounded-full ${
                          emailVerified
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}
                      >
                        {emailVerified ? t.verified : t.unverified}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {userRole || (lang === "id" ? "Pekerjaan belum diatur" : "Occupation not configured")}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                      {userLocation || (lang === "id" ? "Lokasi belum diatur" : "Location not configured")}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={openEditProfile}
                  className="rounded-xl text-xs font-bold h-9 px-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-0 dark:bg-orange-500/15 dark:hover:bg-orange-500/25 flex items-center gap-1.5 transition-all shadow-none z-10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t.editBtn}
                </Button>
              </div>

              {/* Dynamic Email Verification Section */}
              {!emailVerified && (
                <div className="bg-amber-500/5 border border-amber-500/15 p-5 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 shrink-0">
                      <MailWarning className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        {lang === "id" ? "Verifikasi Email Akun Anda" : "Verify Your Account Email"}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed font-semibold">
                        {lang === "id" 
                          ? "Email Anda belum terverifikasi. Harap verifikasi sekarang untuk mengamankan akun dan mengaktifkan seluruh fitur secara penuh." 
                          : "Your email is unverified. Verify now to secure your account and activate all premium features."}
                      </p>
                    </div>
                  </div>

                  {!verificationSent ? (
                    <Button
                      onClick={handleSendVerification}
                      disabled={sendingVerification}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold h-9 px-4 border-0 shadow-md shadow-amber-500/15"
                    >
                      {sendingVerification ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          {lang === "id" ? "Mengirim..." : "Sending..."}
                        </>
                      ) : (
                        lang === "id" ? "Kirim Email Verifikasi" : "Send Verification Email"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3.5 pt-1 border-t border-amber-500/10">
                      {developerCode && (
                        <div className="bg-orange-500/5 text-orange-600 dark:text-orange-400 border border-orange-500/10 p-4 rounded-xl text-xs font-bold space-y-2">
                          <p className="uppercase tracking-wider text-[10px] text-neutral-400">{lang === "id" ? "TRIAL MODE (SALIN KODE DI BAWAH):" : "TRIAL MODE (COPY CODE BELOW):"}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm tracking-widest bg-white dark:bg-neutral-900 border border-orange-500/20 px-4 py-2 rounded-xl inline-block select-all cursor-pointer font-mono">
                              {developerCode}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 max-w-sm">
                        <Input
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          placeholder={lang === "id" ? "Masukkan Kode Verifikasi" : "Enter Verification Code"}
                          className="rounded-xl h-10 text-xs border-neutral-200 dark:border-neutral-800"
                        />
                        <Button
                          onClick={handleVerifyCode}
                          disabled={verifyingEmail || !inputCode.trim()}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold h-10 px-5 border-0 shrink-0 shadow-md shadow-orange-500/15"
                        >
                          {verifyingEmail ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            lang === "id" ? "Verifikasi" : "Verify"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal Information Grid Layout */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-500" />
                    {t.personalInfoTitle}
                  </h3>
                  <Button
                    onClick={openEditPersonalInfo}
                    className="rounded-xl text-[11px] font-bold h-8 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all shadow-none"
                  >
                    <Pencil className="h-3 w-3" />
                    {t.editBtn}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.firstName}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">{firstName || "-"}</span>
                    </div>
                  </div>
                  {/* Last Name Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.lastName}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">{lastName || "-"}</span>
                    </div>
                  </div>
                  {/* Email Cell (DB) */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200 sm:col-span-2">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.emailAddress}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">{user.email}</span>
                    </div>
                  </div>
                  {/* Phone Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.phoneNumber}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">{phone || t.noData}</span>
                    </div>
                  </div>
                  {/* Pekerjaan Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <Pencil className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.bio}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">{bio || t.noData}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {t.addressTitle}
                  </h3>
                  <Button
                    onClick={openEditAddress}
                    className="rounded-xl text-[11px] font-bold h-8 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all shadow-none"
                  >
                    <Pencil className="h-3 w-3" />
                    {t.editBtn}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Address Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200 sm:col-span-2">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.fullAddress}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">{address || t.noData}</span>
                    </div>
                  </div>
                  {/* Country Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <Globe className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.country}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">{country || t.noData}</span>
                    </div>
                  </div>
                  {/* Province/State Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.province}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">{province || t.noData}</span>
                    </div>
                  </div>
                  {/* Postal Code Cell */}
                  <div className="bg-neutral-50/40 dark:bg-neutral-900/40 border border-neutral-100/60 dark:border-neutral-800/40 rounded-2xl p-4 flex items-center gap-3.5 hover:border-orange-500/10 transition-all duration-200">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/5 text-orange-500 flex items-center justify-center border border-orange-500/10">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">{t.postalCode}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">{postalCode || t.noData}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB CONTENT: PASSWORD & SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-500" />
                  {t.securityTitle}
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{t.securityDesc}</p>
              </div>

              {/* Email Verification Card */}
              <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 flex items-center justify-between hover:shadow-md transition-all duration-200 bg-neutral-50/20 dark:bg-neutral-900/40">
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 border ${
                    emailVerified 
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" 
                      : "bg-amber-500/5 border-amber-500/10 text-amber-500"
                  }`}>
                    {emailVerified ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <MailWarning className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{t.emailVerification}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {emailVerified ? t.emailVerifiedMsg : t.emailUnverifiedMsg}
                    </p>
                  </div>
                </div>
                <Badge className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border-none shadow-none uppercase tracking-wider ${
                  emailVerified 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                }`}>
                  {emailVerified ? t.activeStatus : t.pendingStatus}
                </Badge>
              </div>

              {/* Security Tab Email Verification Trigger */}
              {!emailVerified && (
                <div className="bg-amber-500/5 border border-amber-500/15 p-5 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 shrink-0">
                      <MailWarning className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        {lang === "id" ? "Kirim Verifikasi Ke Email" : "Send Verification To Email"}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed font-semibold">
                        {lang === "id" 
                          ? "Email Anda belum terverifikasi. Harap verifikasi sekarang untuk mengamankan akun dan mengaktifkan seluruh fitur secara penuh." 
                          : "Your email is unverified. Verify now to secure your account and activate all premium features."}
                      </p>
                    </div>
                  </div>

                  {!verificationSent ? (
                    <Button
                      onClick={handleSendVerification}
                      disabled={sendingVerification}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold h-9 px-4 border-0 shadow-md shadow-amber-500/15"
                    >
                      {sendingVerification ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          {lang === "id" ? "Mengirim..." : "Sending..."}
                        </>
                      ) : (
                        lang === "id" ? "Kirim Email Verifikasi" : "Send Verification Email"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3.5 pt-1 border-t border-amber-500/10">
                      {developerCode && (
                        <div className="bg-orange-500/5 text-orange-600 dark:text-orange-400 border border-orange-500/10 p-4 rounded-xl text-xs font-bold space-y-2">
                          <p className="uppercase tracking-wider text-[10px] text-neutral-400">{lang === "id" ? "TRIAL MODE (SALIN KODE DI BAWAH):" : "TRIAL MODE (COPY CODE BELOW):"}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm tracking-widest bg-white dark:bg-neutral-900 border border-orange-500/20 px-4 py-2 rounded-xl inline-block select-all cursor-pointer font-mono">
                              {developerCode}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 max-w-sm">
                        <Input
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          placeholder={lang === "id" ? "Masukkan Kode Verifikasi" : "Enter Verification Code"}
                          className="rounded-xl h-10 text-xs border-neutral-200 dark:border-neutral-800"
                        />
                        <Button
                          onClick={handleVerifyCode}
                          disabled={verifyingEmail || !inputCode.trim()}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold h-10 px-5 border-0 shrink-0 shadow-md shadow-orange-500/15"
                        >
                          {verifyingEmail ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            lang === "id" ? "Verifikasi" : "Verify"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Change Password Card */}
              <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 space-y-6 bg-neutral-50/20 dark:bg-neutral-900/40">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{t.changePassword}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">{t.changePasswordDesc}</p>
                  </div>
                  <Button
                    onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPwError(""); setPasswordOpen(true); }}
                    className="rounded-xl text-xs font-bold h-9 px-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-0 dark:bg-orange-500/15 dark:hover:bg-orange-500/25 flex items-center gap-1.5 transition-all shadow-none shrink-0"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {t.changePasswordBtn}
                  </Button>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200/10">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">{t.twoFactor}</p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{t.extraLayer}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200/10 shrink-0">
                      {t.comingSoon}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    {t.notificationTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{t.notificationDesc}</p>
                </div>
              </div>

              <div className="text-[11px] font-semibold bg-orange-500/5 text-orange-500 border border-orange-500/10 p-3 rounded-2xl flex items-center gap-2">
                <Settings className="h-4 w-4 shrink-0" />
                <span>{t.notificationNote}</span>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  checked={soundAlerts}
                  onChange={setSoundAlerts}
                  label={t.orderSound}
                  desc={t.orderSoundDesc}
                  icon={Volume2}
                />
                
                <ToggleSwitch
                  checked={emailReceipts}
                  onChange={setEmailReceipts}
                  label={t.emailReceipt}
                  desc={t.emailReceiptDesc}
                  icon={Mail}
                />

                <ToggleSwitch
                  checked={marketingMails}
                  onChange={setMarketingMails}
                  label={t.marketingEmail}
                  desc={t.marketingEmailDesc}
                  icon={Globe}
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-8 max-w-3xl animate-fade-in">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  {t.billingTitle}
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{t.billingDesc}</p>
              </div>

              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 text-white p-6 shadow-xl border border-neutral-800/80">
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-radial-gradient from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {t.currentPlan}
                      </Badge>
                      <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {subscriptionStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="text-3xl font-black tracking-tight text-white leading-none">
                      {hasRestaurant ? `MenuQR ${activeRestaurantPlan.charAt(0).toUpperCase() + activeRestaurantPlan.slice(1)}` : "MenuQR Free"}
                    </h4>
                    <div className="flex flex-col text-neutral-400 text-xs font-semibold gap-1.5">
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{activeRestaurantName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                        <span>Pembaruan Berikutnya: {formatPeriodEnd(activeSubscription?.currentPeriodEnd)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[11px] font-semibold bg-orange-500/5 text-orange-500 border border-orange-500/10 p-3 rounded-2xl flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>{t.invoiceNote}</span>
                </div>

                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/20 dark:bg-neutral-900/40">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{t.invoiceHistory}</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left min-w-[500px]">
                      <thead>
                        <tr className="bg-neutral-50/50 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-500 font-bold border-b border-neutral-100 dark:border-neutral-800/80">
                          <th className="p-4 uppercase tracking-wider text-[10px]">Invoice ID</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">{t.invoiceDate}</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">{t.invoiceAmount}</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">{t.invoiceStatus}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-neutral-600 dark:text-neutral-300">
                        {paymentHistory.length > 0 ? (
                          paymentHistory.map((inv, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-850/10 transition-colors">
                              <td className="p-4 font-bold text-neutral-950 dark:text-white">{inv.id}</td>
                              <td className="p-4 font-semibold text-neutral-500 dark:text-neutral-450">{inv.date}</td>
                              <td className="p-4 font-extrabold text-neutral-900 dark:text-neutral-200">{inv.amount}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide">
                                  <Check className="h-3 w-3 mr-0.5" />
                                  {inv.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-6 text-center font-semibold text-neutral-400 dark:text-neutral-500">
                              {lang === "id" ? "Belum ada transaksi pembayaran riil di database" : "No real payment records found in database"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: DATA EXPORT */}
          {activeTab === "data-export" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <Download className="h-4 w-4 text-orange-500" />
                  {t.exportTitle}
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{t.exportDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 flex flex-col justify-between gap-5 hover:shadow-md hover:border-orange-500/15 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/5 text-orange-500 border border-orange-500/10 flex items-center justify-center">
                      <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">{t.exportMenu}</h4>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">{t.exportMenuDesc}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold h-9 hover:bg-neutral-50 dark:hover:bg-neutral-800">CSV</Button>
                    <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold h-9 hover:bg-neutral-50 dark:hover:bg-neutral-800">JSON</Button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 flex flex-col justify-between gap-5 hover:shadow-md hover:border-orange-500/15 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/5 text-orange-500 border border-orange-500/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">{t.exportOrders}</h4>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">{t.exportOrdersDesc}</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl text-xs font-bold h-9 hover:bg-neutral-50 dark:hover:bg-neutral-800">{t.downloadCsv}</Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: DELETE ACCOUNT */}
          {activeTab === "delete-account" && (
            <div className="space-y-6 max-w-xl animate-fade-in">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t.dangerZoneTitle}
                </h3>
                <p className="text-xs text-red-400/80 dark:text-red-400/60 mt-1">{t.dangerZoneDesc}</p>
              </div>

              <div className="rounded-3xl bg-red-500/5 dark:bg-red-950/5 border border-red-500/20 dark:border-red-900/30 p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-red-700 dark:text-red-400">{t.deleteAccount}</h4>
                    <p className="text-xs text-red-600/70 dark:text-red-400/60 leading-relaxed">{t.deleteAccountDesc}</p>
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  onClick={() => { setDeleteConfirmName(""); setDeleteOpen(true); }}
                  className="rounded-xl text-xs font-bold h-10 px-5 gap-1.5 shadow-lg shadow-red-500/10 border-0"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.deleteAccountBtn}
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DIALOG 1: Edit Profile Header Details (Role / Occupation) */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="rounded-[24px] max-w-sm border border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">{t.editProfileTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="temp-role" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.bio}</Label>
              <Input
                id="temp-role"
                value={tempRole}
                onChange={(e) => setTempRole(e.target.value)}
                className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
                placeholder="e.g. UI/UX Designer"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditProfileOpen(false)} className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800">{t.cancel}</Button>
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold border-0 shadow-md shadow-orange-500/10">
              {saving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Edit Personal Info */}
      <Dialog open={editPersonalInfoOpen} onOpenChange={setEditPersonalInfoOpen}>
        <DialogContent className="rounded-[24px] max-w-md border border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">{t.editPersonalInfoTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temp-fn" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.firstName}</Label>
                <Input
                  id="temp-fn"
                  value={tempFirstName}
                  onChange={(e) => setTempFirstName(e.target.value)}
                  className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-ln" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.lastName}</Label>
                <Input
                  id="temp-ln"
                  value={tempLastName}
                  onChange={(e) => setTempLastName(e.target.value)}
                  className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-phone" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.phoneNumber}</Label>
              <Input
                id="temp-phone"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-bio" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.bio}</Label>
              <Input
                id="temp-bio"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditPersonalInfoOpen(false)} className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800">{t.cancel}</Button>
            <Button onClick={handleSavePersonalInfo} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold border-0 shadow-md shadow-orange-500/10">
              {saving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Edit Address */}
      <Dialog open={editAddressOpen} onOpenChange={setEditAddressOpen}>
        <DialogContent className="rounded-[24px] max-w-md border border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">{t.editAddressTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="temp-address" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.fullAddress}</Label>
              <Input
                id="temp-address"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temp-country" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.country}</Label>
                <select
                  id="temp-country"
                  value={tempCountry}
                  onChange={(e) => {
                    setTempCountry(e.target.value);
                    setTempProvince("");
                  }}
                  className="w-full rounded-xl h-11 text-sm border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold px-3 dark:text-white"
                >
                  <option value="">Select Country</option>
                  {Object.keys(countryData).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-province" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.province}</Label>
                <select
                  id="temp-province"
                  value={tempProvince}
                  onChange={(e) => setTempProvince(e.target.value)}
                  disabled={!tempCountry}
                  className="w-full rounded-xl h-11 text-sm border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold px-3 disabled:opacity-50 dark:text-white"
                >
                  <option value="">Select Province/State</option>
                  {tempCountry && countryData[tempCountry]?.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-postal" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.postalCode}</Label>
              <Input
                id="temp-postal"
                value={tempPostalCode}
                onChange={(e) => setTempPostalCode(e.target.value)}
                className="rounded-xl h-11 text-sm border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditAddressOpen(false)} className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800">{t.cancel}</Button>
            <Button onClick={handleSaveAddress} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold border-0 shadow-md shadow-orange-500/10">
              {saving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: Change Password */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="rounded-[24px] max-w-sm border border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">{t.changePassword}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.currentPassword}</Label>
              <div className="relative">
                <Input id="current-pw" type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPwError(""); }} className="rounded-xl pr-10 h-11 border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold" placeholder="••••••••" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.newPassword}</Label>
              <div className="relative">
                <Input id="new-pw" type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPwError(""); }} className="rounded-xl pr-10 h-11 border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold" placeholder={t.passwordMinLength} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{t.confirmPassword}</Label>
              <div className="relative">
                <Input id="confirm-pw" type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }} className="rounded-xl pr-10 h-11 border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-semibold" placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-neutral-600">
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {pwError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {pwError}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPasswordOpen(false)} className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800">{t.cancel}</Button>
            <Button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold border-0 shadow-md shadow-orange-500/10">
              {saving ? t.saving : t.changePasswordBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 5: Delete Account */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-[24px] max-w-sm border border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t.deleteConfirmTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
              {t.deleteConfirmDesc.replace("{name}", `"${user.name}"`)}
            </p>
            <div className="space-y-2">
              <Input value={deleteConfirmName} onChange={(e) => setDeleteConfirmName(e.target.value)} className="rounded-xl h-11 border-neutral-200 dark:border-neutral-850 focus-visible:ring-red-500/20 focus-visible:border-red-500 font-semibold" placeholder={t.deleteConfirmPlaceholder} />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800">{t.cancel}</Button>
            <Button onClick={handleDeleteAccount} disabled={saving || deleteConfirmName !== user.name} variant="destructive" className="rounded-xl text-xs font-bold border-0 shadow-md shadow-red-500/10">
              {saving ? t.deleting : t.deleteFinalBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
