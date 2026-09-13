"use client";

import { useEffect, useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Check,
  Crop as CropIcon,
  Eye,
  Lock,
  PenTool,
  PlusCircle,
  RotateCcw,
  Save,
  Sliders,
  ExternalLink,
  X,
  FilePlus,
  Unlock,
  Users,
  LogOut,
  Shield,
  UserCheck,
  UserPlus,
  KeyRound,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";

type FieldChange = {
  field: string;
  label: string;
  oldVal: string;
  newVal: string;
};

type CardData = {
  id: string;
  colophon_id: string;
  slug: string;
  title: string;
  rarity: Rarity;
  rarity_reason: string;
  mood: string;
  sigil: string;
  status: "draft" | "review" | "published" | "archived";
  image_url: string;
  crop_x: number;
  crop_y: number;
  crop_w: number;
  crop_h: number;
  colophons?: {
    id: string;
    heurist_id: number;
    quote: string;
    translation_cs: string | null;
    scribe: string;
    place: string;
    year: number;
    locus: string;
    manuscript_shelfmark: string;
    visual_note: string | null;
  };
};

type GameQuestion = {
  id?: string;
  card_id?: string;
  game_kind: "mood" | "cipher" | "paleo";
  title: string;
  intro: string;
  quote: string;
  options: [string, string][];
  correct_index: number;
  explanation: string;
  hint: string;
  difficulty: "easy" | "medium" | "expert";
};

type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  role: "admin" | "editor" | "reviewer" | "player";
  created_at: string;
};

// Pomocná funkce pro vycentrování ořezu 4:3
function defaultCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 70,
      },
      4 / 3,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function AdminPage() {
  // Autentizace a role
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  // Tým a správa uživatelů
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamProfiles, setTeamProfiles] = useState<UserProfile[]>([]);
  const [showAddColleague, setShowAddColleague] = useState(false);
  const [colleagueEmail, setColleagueEmail] = useState("");
  const [colleaguePassword, setColleaguePassword] = useState("");
  const [colleagueName, setColleagueName] = useState("");
  const [colleagueRole, setColleagueRole] = useState<"editor" | "admin">("editor");
  const [creatingColleague, setCreatingColleague] = useState(false);
  const [colleagueError, setColleagueError] = useState("");
  const [colleagueCreatedInfo, setColleagueCreatedInfo] = useState<{ email: string; pass: string; name: string } | null>(null);

  // Karty a data
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<FieldChange[]>([]);
  const [noChangesNotice, setNoChangesNotice] = useState(false);
  const [lastSavedSummary, setLastSavedSummary] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // React-image-crop stavy (PowerPoint style úchyty a posun)
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [lockRatio, setLockRatio] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Formulář karty
  const [editTitle, setEditTitle] = useState("");
  const [editRarity, setEditRarity] = useState<Rarity>("Common");
  const [editRarityReason, setEditRarityReason] = useState("");
  const [editTranslation, setEditTranslation] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "review" | "published">("published");

  // Minihry
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [showGameForm, setShowGameForm] = useState(false);
  const [newGame, setNewGame] = useState<GameQuestion>({
    game_kind: "mood",
    title: "Nálada písaře",
    intro: "Jak se písař cítil při psaní tohoto kolofonu?",
    quote: "",
    options: [
      ["😌", "Mírumilovný a vděčný"],
      ["😩", "Unavený a bolavý"],
      ["😡", "Rozzuřený na zadavatele"],
    ],
    correct_index: 1,
    explanation: "Písař zmiňuje únavu a touhu po odpočinku nebo poháru vína.",
    hint: "Zaměřte se na zmínky o tělesné únavě nebo bolesti ruky.",
    difficulty: "medium",
  });

  // Přidání nového kolofonu
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    imageUrl: "https://img.scribes.ff.cuni.cz/",
    shelfmark: "",
    locus: "",
    quote: "",
    translation: "",
    scribe: "",
    place: "",
    year: 1420,
    title: "",
    rarity: "Common" as Rarity,
  });

  // Kontrola přihlášení při načtení
  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    setAuthChecking(true);
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    setHasAdmin(count !== null && count > 0);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      await fetchUserProfile(user.id);
    }
    setAuthChecking(false);
  }

  async function fetchUserProfile(userId: string) {
    let { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

    // Pokud profil v databázi ještě není (např. zpoždění triggeru), zajistíme jeho vytvoření
    if (!data) {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email || "";
      const username = email ? email.split("@")[0] : "admin";

      const { data: newProfile } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          username,
          display_name: username,
          role: "admin",
        })
        .select()
        .maybeSingle();

      data = newProfile;
    }

    if (data) {
      // Automatické povýšení prvního registrovaného uživatele na administrátora
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      if ((count === null || count <= 1) && data.role !== "admin") {
        await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
        data.role = "admin";
      }
      setCurrentProfile(data as UserProfile);
    }
  }

  // Načtení karet, jakmile je uživatel ověřen
  useEffect(() => {
    if (currentUser) {
      fetchCards();
    }
  }, [currentUser]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setAuthError(
          "E-mail ještě nebyl potvrzen. Zkontrolujte svou schránku (nebo v Supabase vypněte 'Confirm email' pro okamžité přihlášení)."
        );
      } else {
        setAuthError(error.message);
      }
    } else if (data.user) {
      setCurrentUser(data.user);
      await fetchUserProfile(data.user.id);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });
    if (error) {
      setAuthError(error.message);
    } else if (data.user) {
      if (data.session) {
        setCurrentUser(data.user);
        await fetchUserProfile(data.user.id);
        setAuthSuccessMsg("Účet byl úspěšně vytvořen a přihlášen!");
      } else {
        setAuthSuccessMsg(
          "Účet byl vytvořen! Pokud je zapnuté ověření e-mailu, klikněte na odkaz v e-mailu, nebo se zkuste rovnou přihlásit."
        );
        setAuthMode("login");
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
  }

  // Načtení členů týmu
  async function fetchTeam() {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
    if (data) setTeamProfiles(data as UserProfile[]);
    setShowTeamModal(true);
  }

  async function handleRoleChange(profileId: string, newRole: "admin" | "editor" | "player") {
    await supabase.from("profiles").update({ role: newRole }).eq("id", profileId);
    setTeamProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
    );
  }

  function generateColleaguePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setColleaguePassword(pass);
  }

  async function handleCreateColleague(e: React.FormEvent) {
    e.preventDefault();
    if (!colleagueEmail || !colleaguePassword) return;
    setCreatingColleague(true);
    setColleagueError("");
    setColleagueCreatedInfo(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xqsfjbmexokkmsfcsmdi.supabase.co";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

      // Vytvoříme dočasného klienta s persistSession: false, aby nedošlo k odhlášení přihlášeného admina
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const cleanName = colleagueName.trim() || colleagueEmail.split("@")[0];
      const cleanEmail = colleagueEmail.trim().toLowerCase();
      const cleanPassword = colleaguePassword.trim();

      const { data: signData, error: signErr } = await tempClient.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            username: cleanName,
            full_name: cleanName,
          },
        },
      });

      if (signErr) {
        setColleagueError(signErr.message);
        setCreatingColleague(false);
        return;
      }

      if (signData.user) {
        // Nastavíme profilu roli v tabulce profiles
        await supabase.from("profiles").upsert({
          id: signData.user.id,
          username: cleanName,
          display_name: cleanName,
          role: colleagueRole,
        });

        setColleagueCreatedInfo({
          email: cleanEmail,
          pass: cleanPassword,
          name: cleanName,
        });

        setColleagueEmail("");
        setColleaguePassword("");
        setColleagueName("");

        const { data: refreshedTeam } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: true });
        if (refreshedTeam) setTeamProfiles(refreshedTeam as UserProfile[]);
      }
    } catch (err: any) {
      setColleagueError(err?.message || "Chyba při zakládání účtu.");
    } finally {
      setCreatingColleague(false);
    }
  }

  async function fetchCards() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cards")
      .select(`
        *,
        colophons (
          id, heurist_id, quote, translation_cs, scribe, place, year, locus, manuscript_shelfmark, visual_note
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCards(data as CardData[]);
      if (data.length > 0 && !selectedCard) {
        selectCard(data[0] as CardData);
      }
    }
    setLoading(false);
  }

  function selectCard(card: CardData) {
    setSelectedCard(card);
    setEditTitle(card.title || "");
    setEditRarity(card.rarity || "Common");
    setEditRarityReason(card.rarity_reason || "");
    setEditTranslation(card.colophons?.translation_cs || "");
    setEditStatus(card.status === "archived" ? "draft" : card.status);

    if (card.crop_w && Number(card.crop_w) > 5 && Number(card.crop_w) < 99) {
      setCrop({
        unit: "%",
        x: Number(card.crop_x) || 10,
        y: Number(card.crop_y) || 10,
        width: Number(card.crop_w) || 70,
        height: Number(card.crop_h) || 52.5,
      });
    } else {
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
    fetchQuestions(card.id);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (crop && crop.width && crop.height) {
      setCompletedCrop({
        unit: "px",
        x: (crop.x / 100) * width,
        y: (crop.y / 100) * height,
        width: (crop.width / 100) * width,
        height: (crop.height / 100) * height,
      });
    } else {
      const initial = defaultCrop(width, height);
      setCrop(initial);
      setCompletedCrop({
        unit: "px",
        x: (initial.x / 100) * width,
        y: (initial.y / 100) * height,
        width: (initial.width / 100) * width,
        height: (initial.height / 100) * height,
      });
    }
  }

  async function fetchQuestions(cardId: string) {
    const { data } = await supabase.from("game_questions").select("*").eq("card_id", cardId);
    if (data) setQuestions(data as GameQuestion[]);
  }

  function getPendingChanges(): FieldChange[] {
    if (!selectedCard) return [];
    const changes: FieldChange[] = [];

    // 1. Název karty
    if (editTitle.trim() !== (selectedCard.title || "").trim()) {
      changes.push({
        field: "title",
        label: "Název karty",
        oldVal: selectedCard.title || "(prázdné)",
        newVal: editTitle.trim() || "(prázdné)",
      });
    }

    // 2. Rarita
    if (editRarity !== selectedCard.rarity) {
      changes.push({
        field: "rarity",
        label: "Rarita karty",
        oldVal: selectedCard.rarity,
        newVal: editRarity,
      });
    }

    // 3. Důvod rarity
    if ((editRarityReason || "").trim() !== (selectedCard.rarity_reason || "").trim()) {
      changes.push({
        field: "rarity_reason",
        label: "Důvod rarity",
        oldVal: selectedCard.rarity_reason || "(prázdné)",
        newVal: editRarityReason.trim() || "(prázdné)",
      });
    }

    // 4. Český překlad
    const oldTrans = selectedCard.colophons?.translation_cs || "";
    if (editTranslation.trim() !== oldTrans.trim()) {
      changes.push({
        field: "translation",
        label: "Český překlad kolofonu",
        oldVal: oldTrans || "(bez překladu)",
        newVal: editTranslation.trim() || "(bez překladu)",
      });
    }

    // 5. Stav
    if (editStatus !== selectedCard.status) {
      changes.push({
        field: "status",
        label: "Stav publikace karty",
        oldVal: selectedCard.status,
        newVal: editStatus,
      });
    }

    // 6. Ořez
    if (imgRef.current && completedCrop) {
      const img = imgRef.current;
      const pctX = Math.round((completedCrop.x / img.width) * 1000) / 10;
      const pctY = Math.round((completedCrop.y / img.height) * 1000) / 10;
      const pctW = Math.round((completedCrop.width / img.width) * 1000) / 10;
      const pctH = Math.round((completedCrop.height / img.height) * 1000) / 10;

      const oldX = Number(selectedCard.crop_x) || 0;
      const oldY = Number(selectedCard.crop_y) || 0;
      const oldW = Number(selectedCard.crop_w) || 0;
      const oldH = Number(selectedCard.crop_h) || 0;

      if (
        Math.abs(pctX - oldX) > 0.4 ||
        Math.abs(pctY - oldY) > 0.4 ||
        Math.abs(pctW - oldW) > 0.4 ||
        Math.abs(pctH - oldH) > 0.4
      ) {
        changes.push({
          field: "crop",
          label: "Výřez folia (ořez)",
          oldVal: `X: ${oldX} %, Y: ${oldY} %, Šířka: ${oldW} %, Výška: ${oldH} %`,
          newVal: `X: ${pctX} %, Y: ${pctY} %, Šířka: ${pctW} %, Výška: ${pctH} %`,
        });
      }
    }

    return changes;
  }

  function handleOpenSaveConfirmation() {
    if (!selectedCard || !imgRef.current || !completedCrop) return;
    const changes = getPendingChanges();
    if (changes.length === 0) {
      setNoChangesNotice(true);
      setTimeout(() => setNoChangesNotice(false), 3000);
      return;
    }
    setPendingChanges(changes);
    setShowDiffModal(true);
  }

  async function executeSave() {
    if (!selectedCard || !imgRef.current || !completedCrop) return;
    setSaving(true);
    setSaveSuccess(false);

    const img = imgRef.current;
    const pctX = Math.round((completedCrop.x / img.width) * 1000) / 10;
    const pctY = Math.round((completedCrop.y / img.height) * 1000) / 10;
    const pctW = Math.round((completedCrop.width / img.width) * 1000) / 10;
    const pctH = Math.round((completedCrop.height / img.height) * 1000) / 10;

    const { error: cardErr } = await supabase
      .from("cards")
      .update({
        title: editTitle,
        rarity: editRarity,
        rarity_reason: editRarityReason,
        status: editStatus,
        crop_x: pctX,
        crop_y: pctY,
        crop_w: pctW,
        crop_h: pctH,
      })
      .eq("id", selectedCard.id);

    if (selectedCard.colophon_id) {
      await supabase
        .from("colophons")
        .update({ translation_cs: editTranslation })
        .eq("id", selectedCard.colophon_id);
    }

    setSaving(false);
    setShowDiffModal(false);

    if (!cardErr) {
      const count = pendingChanges.length;
      setLastSavedSummary(count === 1 ? "1 změna uložena" : count < 5 ? `${count} změny uloženy` : `${count} změn uloženo`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      fetchCards();
    }
  }

  async function handleCreateNewColophon(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.imageUrl || !newForm.quote) return;

    setSaving(true);
    const newHeuristId = Date.now();

    const { data: colophon, error: colError } = await supabase
      .from("colophons")
      .insert({
        heurist_id: newHeuristId,
        quote: newForm.quote,
        translation_cs: newForm.translation || null,
        scribe: newForm.scribe || "Unknown scribe",
        place: newForm.place || "Unknown place",
        year: Number(newForm.year) || 1400,
        locus: newForm.locus || "1r",
        manuscript_shelfmark: newForm.shelfmark || "Neznámý rukopis",
        source_url: newForm.imageUrl,
      })
      .select()
      .single();

    if (!colError && colophon) {
      const { data: newCard, error: cardError } = await supabase
        .from("cards")
        .insert({
          colophon_id: colophon.id,
          slug: `card-${newHeuristId}`,
          title: newForm.title || "Nový kolofon",
          rarity: newForm.rarity,
          status: "published",
          image_url: newForm.imageUrl,
          crop_x: 15,
          crop_y: 15,
          crop_w: 70,
          crop_h: 52.5,
        })
        .select(`
          *,
          colophons (
            id, heurist_id, quote, translation_cs, scribe, place, year, locus, manuscript_shelfmark, visual_note
          )
        `)
        .single();

      if (!cardError && newCard) {
        setCards([newCard as CardData, ...cards]);
        selectCard(newCard as CardData);
        setShowNewModal(false);
      }
    }
    setSaving(false);
  }

  async function handleAddGame() {
    if (!selectedCard) return;
    const toInsert = {
      ...newGame,
      card_id: selectedCard.id,
      quote: newGame.quote || selectedCard.colophons?.quote || "",
    };
    const { data, error } = await supabase.from("game_questions").insert(toInsert).select().single();
    if (!error && data) {
      setQuestions([...questions, data as GameQuestion]);
      setShowGameForm(false);
    }
  }

  const filteredCards = cards.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.colophons?.quote.toLowerCase().includes(search.toLowerCase()) ||
      c.colophons?.scribe.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Uniformní měřítko pro náhled karty (100% zachování proporcí bez jakékoliv deformace!)
  const CARD_IMG_W = 244;
  const CARD_IMG_H = 183; // přesný poměr 4:3 pro formát karty

  let uniformScale = 1;
  let renderW = 0;
  let renderH = 0;
  let renderLeft = 0;
  let renderTop = 0;

  if (imgRef.current && completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
    const img = imgRef.current;
    uniformScale = Math.min(CARD_IMG_W / completedCrop.width, CARD_IMG_H / completedCrop.height);
    renderW = img.width * uniformScale;
    renderH = img.height * uniformScale;

    const offsetX = (CARD_IMG_W - completedCrop.width * uniformScale) / 2;
    const offsetY = (CARD_IMG_H - completedCrop.height * uniformScale) / 2;
    let rLeft = offsetX - completedCrop.x * uniformScale;
    let rTop = offsetY - completedCrop.y * uniformScale;

    // Clamping hran: zabrání vzniku prázdných mezer na okrajích, pokud je rukopis větší než rámeček
    if (renderW >= CARD_IMG_W) {
      rLeft = Math.min(0, Math.max(CARD_IMG_W - renderW, rLeft));
    } else {
      rLeft = (CARD_IMG_W - renderW) / 2;
    }

    if (renderH >= CARD_IMG_H) {
      rTop = Math.min(0, Math.max(CARD_IMG_H - renderH, rTop));
    } else {
      rTop = (CARD_IMG_H - renderH) / 2;
    }

    renderLeft = rLeft;
    renderTop = rTop;
  }

  // PŘIHLAŠOVACÍ OBRAZOVKA (Pokud není uživatel přihlášen)
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#110f0d] text-[#e8ded1] flex items-center justify-center font-serif text-sm">
        Ověřuji oprávnění správce...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f0d0b] text-[#e8ded1] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1613] border border-[#3b3127] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2e2518] border border-[#ffd580]/40 text-[#ffd580] font-serif font-bold text-xl mb-1">
              Q
            </div>
            <h1 className="text-xl font-serif font-bold text-[#ffd580]">Quilldrop Studio</h1>
            <p className="text-xs text-[#9c8976]">Vstup pro editory a správce rukopisů</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-xs text-red-200">
              {authError}
            </div>
          )}

          {authSuccessMsg && (
            <div className="p-3 bg-green-950/60 border border-green-800/80 rounded text-xs text-green-200">
              {authSuccessMsg}
            </div>
          )}

          <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#9c8976] mb-1">E-mail</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="vas@email.cz"
                className="w-full bg-[#120f0d] border border-[#3b3127] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#9c8976] mb-1">Heslo</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#120f0d] border border-[#3b3127] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#d4af37] hover:bg-[#c39e2e] text-[#1a1613] font-bold py-2.5 rounded-lg text-xs transition cursor-pointer shadow"
            >
              {authMode === "login" ? "Přihlásit se do Studia" : "Vytvořit účet správce"}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#2e261f]">
            {!hasAdmin ? (
              authMode === "login" ? (
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                  className="text-xs text-[#c9a96e] hover:underline cursor-pointer"
                >
                  Nemáte ještě účet? Vytvořit první účet správce
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className="text-xs text-[#c9a96e] hover:underline cursor-pointer"
                >
                  Už máte účet? Přihlásit se
                </button>
              )
            ) : (
              <p className="text-[11px] text-[#7d6f62]">
                🔒 Registrace je uzavřena. Přístup vám může zřídit pouze hlavní správce v administraci.
              </p>
            )}
          </div>

          <div className="text-center">
            <a href="/" className="text-xs text-[#6e6154] hover:text-[#a89887]">
              ← Zpět do veřejné hry
            </a>
          </div>
        </div>
      </div>
    );
  }

  // KONTROLA ROLE (Pokud uživatel není admin nebo editor)
  const isAllowedRole = currentProfile?.role === "admin" || currentProfile?.role === "editor";
  if (!isAllowedRole) {
    return (
      <div className="min-h-screen bg-[#0f0d0b] text-[#e8ded1] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1613] border border-[#3b3127] rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <Shield size={36} className="mx-auto text-[#d4af37]" />
          <h2 className="text-lg font-serif font-bold text-[#ffd580]">Čeká se na oprávnění</h2>
          <p className="text-xs text-[#a89887]">
            Jste přihlášen jako <b>{currentUser.email}</b>, ale váš účet má roli hráče. Pro přístup do
            Quilldrop Studia požádejte administrátora o přidělení role <b>Editora</b>.
          </p>
          <button
            onClick={handleLogout}
            className="bg-[#2e2518] hover:bg-[#3d3120] text-xs text-[#e8ded1] px-4 py-2 rounded border border-[#52422b] cursor-pointer"
          >
            Odhlásit se
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110f0d] text-[#e8ded1] flex flex-col font-sans">
      {/* HORNÍ LIŠTA */}
      <header className="border-b border-[#2e2721] bg-[#1a1613] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#b39e87] hover:text-[#e8ded1] transition"
          >
            <ArrowLeft size={16} /> Zpět do hry
          </a>
          <span className="text-[#4a3f35]">|</span>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-[#ffd580] tracking-wide">
              Quilldrop Studio
            </span>
            <span className="text-[11px] text-[#a89887] bg-[#29221b] px-2.5 py-0.5 rounded border border-[#3d3226]">
              Správa rukopisů a karet
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Uživatel a role */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8c7b6d]">{currentUser.email}</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                currentProfile?.role === "admin"
                  ? "bg-[#3d3120] text-[#ffd580] border-[#d4af37]"
                  : "bg-[#18232e] text-[#4a9eff] border-[#294a6e]"
              }`}
            >
              {currentProfile?.role}
            </span>
          </div>

          {currentProfile?.role === "admin" && (
            <button
              onClick={fetchTeam}
              className="flex items-center gap-1.5 text-xs bg-[#241e19] hover:bg-[#332b24] text-[#c9a96e] px-2.5 py-1.5 rounded border border-[#42372d] cursor-pointer transition"
              title="Správa uživatelů a rolí"
            >
              <Users size={13} /> Tým ({teamProfiles.length || "..."})
            </button>
          )}

          {noChangesNotice && (
            <span className="text-xs text-[#c9a96e] flex items-center gap-1 bg-[#29221b] px-2.5 py-1 rounded border border-[#52422b]">
              <AlertCircle size={14} className="text-[#ffd580]" /> Žádné neuložené změny
            </span>
          )}

          {saveSuccess && (
            <span className="text-xs text-[#73d13d] flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
              <Check size={14} /> {lastSavedSummary || "Uloženo do Supabase"}
            </span>
          )}

          <button
            onClick={handleOpenSaveConfirmation}
            disabled={saving || !selectedCard}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c39e2e] text-[#1a1613] font-bold text-xs px-4 py-2 rounded shadow transition disabled:opacity-50 cursor-pointer"
            title="Zkontrolovat a uložit změny do Supabase"
          >
            <Save size={15} />
            {saving ? "Ukládám..." : "Uložit změny"}
          </button>

          <button
            onClick={handleLogout}
            className="text-[#8c7b6d] hover:text-white p-1.5 rounded hover:bg-[#2e261f] cursor-pointer transition"
            title="Odhlásit se"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* HLAVNÍ PLOCHA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEVÝ PANEL: Seznam karet */}
        <aside className="w-80 border-r border-[#2e2721] bg-[#14110f] flex flex-col">
          <div className="p-3 border-b border-[#2e2721] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#c9a96e] uppercase tracking-wider">
                Katalog ({cards.length})
              </span>
              <button
                onClick={() => setShowNewModal(true)}
                className="text-xs text-[#ffd580] hover:text-white bg-[#2e2518] hover:bg-[#3d3120] border border-[#52422b] px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition"
              >
                <PlusCircle size={13} /> Nový kolofon
              </button>
            </div>

            <input
              type="text"
              placeholder="Hledat kolofon, písaře..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37]"
            />
            <div className="flex gap-1">
              {["all", "published", "draft"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] px-2 py-0.5 rounded capitalize ${
                    statusFilter === st
                      ? "bg-[#3d3226] text-[#ffd580] font-semibold"
                      : "text-[#8c7b6d] hover:text-[#d1c2b4]"
                  }`}
                >
                  {st === "all" ? "Vše" : st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1e1915]">
            {loading ? (
              <p className="text-xs text-[#7d6f62] p-4 text-center">Načítám z databáze...</p>
            ) : filteredCards.length === 0 ? (
              <p className="text-xs text-[#7d6f62] p-4 text-center">Žádné karty nenalezeny.</p>
            ) : (
              filteredCards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCard(c)}
                  className={`w-full text-left p-3 transition flex items-start gap-2.5 cursor-pointer ${
                    selectedCard?.id === c.id
                      ? "bg-[#29221b] border-l-2 border-[#d4af37]"
                      : "hover:bg-[#1a1512]"
                  }`}
                >
                  <div className="w-10 h-14 bg-[#231d18] rounded border border-[#3d3226] overflow-hidden shrink-0 relative">
                    <img src={c.image_url} alt="" className="w-full h-full object-cover opacity-80" />
                    <span className="absolute bottom-0 right-0 text-[8px] bg-black/80 px-1 text-[#d4af37]">
                      {c.rarity[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-[#e8ded1]">{c.title}</p>
                    <p className="text-[11px] text-[#9c8976] truncate italic">
                      {c.colophons?.quote || "Bez citátu"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#7d6f62]">
                      <span>{c.colophons?.scribe || "Neznámý písař"}</span>
                      <span>•</span>
                      <span className="text-[#c9a96e]">{c.rarity}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* STŘEDNÍ PANEL: Plnohodnotný PowerPoint-style ořez */}
        <main className="flex-1 bg-[#0a0908] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#2e2721] bg-[#14110f] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#c9a96e] font-semibold flex items-center gap-1.5">
                <CropIcon size={14} /> Výřez rukopisu
              </span>
              <span className="text-[#8c7b6d]">
                (Táhněte za <b>rohy rámečku</b> pro změnu velikosti, nebo <b>uvnitř</b> pro posunutí)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLockRatio(!lockRatio)}
                className={`text-[11px] px-2.5 py-1 rounded border flex items-center gap-1.5 transition cursor-pointer ${
                  lockRatio
                    ? "bg-[#3d3120] border-[#d4af37] text-[#ffd580]"
                    : "bg-[#231d18] border-[#3b322a] text-[#8c7b6d]"
                }`}
                title="Zamkne poměr stran 4:3 pro formát karty"
              >
                {lockRatio ? <Lock size={12} /> : <Unlock size={12} />}
                Poměr 4:3 (Karta)
              </button>

              <button
                onClick={() => {
                  if (imgRef.current) {
                    setCrop(defaultCrop(imgRef.current.width, imgRef.current.height));
                  }
                }}
                className="text-[11px] text-[#b39e87] hover:text-[#e8ded1] px-2 py-1 bg-[#231d18] rounded border border-[#3b322a] flex items-center gap-1 cursor-pointer"
                title="Vycentrovat výřez"
              >
                <RotateCcw size={12} /> Vycentrovat
              </button>
            </div>
          </div>

          {/* PLÁTNO S OŘEZEM (ReactCrop) */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative select-none">
            {selectedCard ? (
              <div className="max-w-full max-h-full border border-[#3d3226] shadow-2xl bg-[#14110f]">
                <ReactCrop
                  crop={crop}
                  onChange={(c, percentCrop) => {
                    setCrop(percentCrop);
                  }}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={lockRatio ? 4 / 3 : undefined}
                  minWidth={80}
                  minHeight={60}
                  className="max-h-[72vh]"
                >
                  <img
                    ref={imgRef}
                    src={selectedCard.image_url}
                    alt="Folio rukopisu"
                    onLoad={onImageLoad}
                    className="max-h-[72vh] w-auto block select-none"
                  />
                </ReactCrop>
              </div>
            ) : (
              <p className="text-xs text-[#7d6f62]">Vyberte kartu vlevo pro úpravu výřezu.</p>
            )}
          </div>

          {/* SPODNÍ INFORMACE */}
          {selectedCard?.colophons && (
            <div className="p-3 border-t border-[#2e2721] bg-[#14110f] text-[11px] text-[#9c8976] flex items-center justify-between">
              <div>
                <b>Rukopis:</b> {selectedCard.colophons.manuscript_shelfmark} | <b>Folio:</b>{" "}
                {selectedCard.colophons.locus} | <b>Písař:</b> {selectedCard.colophons.scribe} (
                {selectedCard.colophons.year})
              </div>
              <a
                href={selectedCard.image_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#d4af37] hover:underline flex items-center gap-1"
              >
                Otevřít originál v plném rozlišení <ExternalLink size={12} />
              </a>
            </div>
          )}
        </main>

        {/* PRAVÝ PANEL: ŽIVÝ NÁHLED KARTY (PŘIROZENÉ MĚŘÍTKO BEZ DEFORMACE) + FORMULÁŘ */}
        <aside className="w-96 border-l border-[#2e2721] bg-[#161310] flex flex-col overflow-y-auto">
          {selectedCard && (
            <div className="p-4 space-y-6">
              {/* ŽIVÝ NÁHLED KARTY */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a96e] mb-2 flex items-center gap-1.5">
                  <Eye size={13} /> Živý náhled karty (přesně podle výřezu)
                </h3>

                {/* Karta */}
                <div
                  className={`w-full max-w-[270px] mx-auto rounded-xl p-3 border shadow-2xl transition-all ${
                    editRarity === "Unique"
                      ? "bg-gradient-to-b from-[#2e2518] to-[#1a140d] border-[#ffd580] shadow-[0_0_20px_rgba(255,213,128,0.25)]"
                      : editRarity === "Legendary"
                      ? "bg-gradient-to-b from-[#2e1d18] to-[#1a110d] border-[#ff8c00]"
                      : editRarity === "Epic"
                      ? "bg-gradient-to-b from-[#25182e] to-[#140d1a] border-[#b35cd6]"
                      : editRarity === "Rare"
                      ? "bg-gradient-to-b from-[#18232e] to-[#0d141a] border-[#4a9eff]"
                      : "bg-[#1f1a16] border-[#42372d]"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-[#d4af37] mb-1.5">
                    <span>✦ {editRarity.toUpperCase()} ✦</span>
                    <span>{selectedCard.sigil}</span>
                  </div>

                  {/* VÝŘEZ FOTKY: PŘIROZENÉ MĚŘÍTKO BEZ JAKÉKOLIV DEFORMACE */}
                  <div
                    style={{ height: `${CARD_IMG_H}px` }}
                    className="w-full bg-[#16120e] rounded-lg border border-[#4a3f35] overflow-hidden relative shadow-inner flex items-center justify-center"
                  >
                    {renderW > 0 && selectedCard && (
                      <img
                        src={selectedCard.image_url}
                        alt=""
                        style={{
                          position: "absolute",
                          maxWidth: "none",
                          maxHeight: "none",
                          width: `${renderW}px`,
                          height: `${renderH}px`,
                          left: `${renderLeft}px`,
                          top: `${renderTop}px`,
                        }}
                      />
                    )}
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-[#d4af37] text-[9px] px-1.5 py-0.5 rounded font-mono z-10 border border-[#4a3f35]">
                      {selectedCard.colophons?.year}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#ffd580] mt-2 leading-tight">
                    {editTitle}
                  </h4>
                  <p className="text-[11px] text-[#bdae9e] italic mt-1 line-clamp-2">
                    “{selectedCard.colophons?.quote}”
                  </p>
                  {editTranslation && (
                    <p className="text-[10px] text-[#9c8976] mt-1 line-clamp-2">
                      {editTranslation}
                    </p>
                  )}
                  <div className="text-[9px] text-[#7d6f62] mt-2 pt-1 border-t border-[#332921] flex justify-between">
                    <span>{selectedCard.colophons?.scribe}</span>
                    <span>{selectedCard.colophons?.place}</span>
                  </div>
                </div>
              </div>

              {/* REDAKCE TEXTŮ A RARITY */}
              <div className="space-y-3 pt-2 border-t border-[#2e2721]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a96e] flex items-center gap-1.5">
                  <PenTool size={13} /> Texty a klasifikace
                </h3>

                <div>
                  <label className="text-[11px] text-[#9c8976] block mb-1">Název karty</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#9c8976] block mb-1">Rarita</label>
                    <select
                      value={editRarity}
                      onChange={(e) => setEditRarity(e.target.value as Rarity)}
                      className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Unique">Unique</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#9c8976] block mb-1">Stav</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="published">Publikováno</option>
                      <option value="draft">Koncept (Draft)</option>
                      <option value="review">Ke kontrole</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#9c8976] block mb-1">
                    Odůvodnění rarity (pro hráče)
                  </label>
                  <textarea
                    rows={2}
                    value={editRarityReason}
                    onChange={(e) => setEditRarityReason(e.target.value)}
                    placeholder="Např. Výrazná rubrikace, neobvyklá stížnost písaře..."
                    className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#9c8976] block mb-1">
                    Český překlad kolofonu
                  </label>
                  <textarea
                    rows={3}
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    placeholder="Doplňte překlad pro studenty a veřejnost..."
                    className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* MINIHRY */}
              <div className="space-y-3 pt-2 border-t border-[#2e2721]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a96e] flex items-center gap-1.5">
                    Minihry k tomuto kolofonu ({questions.length})
                  </h3>
                  <button
                    onClick={() => setShowGameForm(!showGameForm)}
                    className="text-[11px] text-[#ffd580] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={12} /> Přidat
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-2.5 bg-[#1f1a16] border border-[#332921] rounded text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-[#ffd580]">
                      <span>{q.title}</span>
                      <span className="text-[10px] text-[#8c7b6d] capitalize">{q.game_kind}</span>
                    </div>
                    <p className="text-[11px] text-[#9c8976]">{q.intro}</p>
                    <div className="text-[10px] text-[#73d13d]">
                      Správná odpověď: {q.options[q.correct_index]?.[1] || "Není zvolena"}
                    </div>
                  </div>
                ))}

                {showGameForm && (
                  <div className="p-3 bg-[#1c1713] border border-[#d4af37]/40 rounded space-y-2.5 text-xs">
                    <p className="font-bold text-[#ffd580]">Nová otázka k minihře</p>
                    <div>
                      <label className="text-[10px] text-[#9c8976]">Typ minihry</label>
                      <select
                        value={newGame.game_kind}
                        onChange={(e) =>
                          setNewGame({ ...newGame, game_kind: e.target.value as any })
                        }
                        className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs"
                      >
                        <option value="mood">Scribe’s Mood (Nálada písaře)</option>
                        <option value="cipher">Crack the Colophon (Doplňování)</option>
                        <option value="paleo">Palaeographer (Určení písma)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#9c8976]">Zadání (intro)</label>
                      <input
                        type="text"
                        value={newGame.intro}
                        onChange={(e) => setNewGame({ ...newGame, intro: e.target.value })}
                        className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#9c8976]">Možnosti a správná volba</label>
                      <div className="space-y-1 mt-1">
                        {newGame.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="correct_opt"
                              checked={newGame.correct_index === i}
                              onChange={() => setNewGame({ ...newGame, correct_index: i })}
                            />
                            <input
                              type="text"
                              value={opt[1]}
                              onChange={(e) => {
                                const nextOpts = [...newGame.options];
                                nextOpts[i] = [opt[0], e.target.value];
                                setNewGame({ ...newGame, options: nextOpts as [string, string][] });
                              }}
                              className="flex-1 bg-[#14110f] border border-[#332921] rounded px-1.5 py-0.5 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleAddGame}
                      className="w-full bg-[#d4af37] text-black font-bold py-1 rounded hover:bg-[#c39e2e] transition cursor-pointer"
                    >
                      Uložit minihru do Supabase
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* MODÁLNÍ OKNO: SPRÁVA TÝMU A ROLÍ */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1613] border border-[#3d3226] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-[#2e2721] flex justify-between items-center bg-[#211c18]">
              <h3 className="text-sm font-bold text-[#ffd580] flex items-center gap-2">
                <Users size={16} /> Správa týmu a oprávnění
              </h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-[#9c8976] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#a89887] text-[11px]">
                Zde vidíte všechny registrované uživatele v databázi. Jako administrátor můžete kolegům
                přidělit roli <b>Editora</b> (může ořezávat fotky a doplňovat texty) nebo <b>Správce</b>.
              </p>

              <div className="divide-y divide-[#2e2721] border border-[#2e2721] rounded-lg overflow-hidden bg-[#14110f]">
                {teamProfiles.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{p.display_name || p.username || "Uživatel"}</p>
                      <p className="text-[10px] text-[#7d6f62]">ID: {p.id.slice(0, 8)}...</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={p.role}
                        onChange={(e) =>
                          handleRoleChange(p.id, e.target.value as "admin" | "editor" | "player")
                        }
                        className="bg-[#241e19] border border-[#3d3226] rounded px-2 py-1 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="admin">Správce (Admin)</option>
                        <option value="editor">Editor (Curator)</option>
                        <option value="player">Hráč (Pouze čtení)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {colleagueCreatedInfo && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-700/80 rounded-lg text-emerald-200 text-xs space-y-2">
                  <div className="font-bold flex items-center justify-between">
                    <span>✅ Účet pro {colleagueCreatedInfo.name} byl vytvořen!</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Ahoj, zde jsou tvoje přihlašovací údaje do Quilldrop Studia:\nWeb: ${window.location.origin}/admin\nE-mail: ${colleagueCreatedInfo.email}\nHeslo: ${colleagueCreatedInfo.pass}`
                        );
                        alert("Přihlašovací údaje byly zkopírovány do schránky!");
                      }}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition"
                    >
                      <Copy size={12} /> Kopírovat údaje pro kolegu
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-300/90 font-mono bg-black/30 p-2 rounded">
                    E-mail: <b>{colleagueCreatedInfo.email}</b><br />
                    Heslo: <b>{colleagueCreatedInfo.pass}</b>
                  </p>
                </div>
              )}

              {!showAddColleague ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddColleague(true);
                    setColleagueError("");
                    setColleagueCreatedInfo(null);
                    generateColleaguePassword();
                  }}
                  className="w-full bg-[#241e19] hover:bg-[#332a22] text-[#ffd580] border border-[#52422b] py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow"
                >
                  <UserPlus size={15} /> Založit účet pro kolegu (Editora)
                </button>
              ) : (
                <form onSubmit={handleCreateColleague} className="p-4 bg-[#1e1814] border border-[#4a3d2c] rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#3b3023]">
                    <h4 className="font-serif font-bold text-xs text-[#ffd580] flex items-center gap-1.5">
                      <UserPlus size={14} /> Nový účet pro kolegu
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddColleague(false)}
                      className="text-[#8c7b6d] hover:text-white text-xs cursor-pointer"
                    >
                      Zavřít
                    </button>
                  </div>

                  {colleagueError && (
                    <div className="p-2 bg-red-950/60 border border-red-800/80 rounded text-[11px] text-red-200">
                      {colleagueError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#9c8976] mb-1">Jméno a příjmení / Přezdívka *</label>
                      <input
                        type="text"
                        required
                        value={colleagueName}
                        onChange={(e) => setColleagueName(e.target.value)}
                        placeholder="Např. Lucie Doležalová"
                        className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#9c8976] mb-1">Role v Quilldropu</label>
                      <select
                        value={colleagueRole}
                        onChange={(e) => setColleagueRole(e.target.value as "editor" | "admin")}
                        className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="editor">Editor (Curator - ořez a texty)</option>
                        <option value="admin">Správce (Plný přístup včetně týmu)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#9c8976] mb-1">E-mail kolegy *</label>
                    <input
                      type="email"
                      required
                      value={colleagueEmail}
                      onChange={(e) => setColleagueEmail(e.target.value)}
                      placeholder="kolega@ff.cuni.cz"
                      className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-[#9c8976]">Počáteční heslo *</label>
                      <button
                        type="button"
                        onClick={generateColleaguePassword}
                        className="text-[10px] text-[#c9a96e] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={10} /> Vygenerovat náhodné
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={colleaguePassword}
                      onChange={(e) => setColleaguePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs font-mono text-[#ffd580] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddColleague(false)}
                      className="px-3 py-1 text-xs text-[#8c7b6d] hover:text-white cursor-pointer"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      disabled={creatingColleague}
                      className="bg-[#d4af37] hover:bg-[#c39e2e] text-[#1a1613] font-bold text-xs px-3.5 py-1.5 rounded transition disabled:opacity-50 cursor-pointer shadow"
                    >
                      {creatingColleague ? "Zakládám účet..." : "Vytvořit účet a oprávnění"}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="bg-[#d4af37] text-black font-bold px-4 py-1.5 rounded hover:bg-[#c39e2e] transition text-xs cursor-pointer"
                >
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODÁLNÍ OKNO: POTVRZENÍ A KONTROLA ZMĚN */}
      {showDiffModal && selectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1613] border border-[#3d3226] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-[#2e2721] flex justify-between items-center bg-[#211c18]">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#d4af37]" />
                <h3 className="text-sm font-serif font-bold text-[#ffd580]">
                  Kontrola změn před uložením
                </h3>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-[#9c8976] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between text-xs bg-[#14110f] p-3 rounded-lg border border-[#2e2721]">
                <div>
                  <p className="font-bold text-white">{selectedCard.title}</p>
                  <p className="text-[11px] text-[#9c8976]">
                    {selectedCard.colophons?.manuscript_shelfmark} ({selectedCard.colophons?.locus})
                  </p>
                </div>
                <span className="text-[11px] bg-[#3d3120] text-[#ffd580] px-2.5 py-1 rounded border border-[#d4af37]/40 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#73d13d]" />
                  {pendingChanges.length} {pendingChanges.length === 1 ? "změna" : pendingChanges.length < 5 ? "změny" : "změn"}
                </span>
              </div>

              <div className="space-y-3">
                {pendingChanges.map((ch) => (
                  <div key={ch.field} className="p-3 bg-[#16120e] border border-[#3b3023] rounded-lg text-xs space-y-2">
                    <span className="font-semibold text-[#ffd580] text-[11px] uppercase tracking-wider block">
                      {ch.label}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-red-950/25 border border-red-900/30 rounded">
                        <span className="text-[10px] text-red-400 font-bold block mb-1">Původní stav:</span>
                        <p className="text-red-200/90 line-through text-[11px] break-words">
                          {ch.oldVal}
                        </p>
                      </div>
                      <div className="p-2.5 bg-emerald-950/25 border border-emerald-800/40 rounded">
                        <span className="text-[10px] text-emerald-400 font-bold block mb-1">Nový stav:</span>
                        <p className="text-emerald-200 font-medium text-[11px] break-words">
                          {ch.newVal}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#2e2721] bg-[#171310] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 text-xs text-[#a89887] hover:text-white rounded hover:bg-[#261f18] cursor-pointer transition"
              >
                Zpět k úpravám
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c39e2e] text-[#1a1613] font-bold text-xs px-5 py-2 rounded shadow transition cursor-pointer disabled:opacity-50"
              >
                <Check size={15} />
                {saving ? "Ukládám do Supabase..." : "Potvrdit a uložit do Supabase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODÁLNÍ OKNO: PŘIDÁNÍ NOVÉHO KOLOFONU */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1613] border border-[#3d3226] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-[#2e2721] flex justify-between items-center bg-[#211c18]">
              <h3 className="text-sm font-bold text-[#ffd580] flex items-center gap-2">
                <FilePlus size={16} /> Přidat nový kolofon do databáze
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#9c8976] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewColophon} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-[#9c8976] mb-1">
                  URL adresa obrázku (IIIF nebo přímý odkaz na JPG/PNG) *
                </label>
                <input
                  type="url"
                  required
                  value={newForm.imageUrl}
                  onChange={(e) => setNewForm({ ...newForm, imageUrl: e.target.value })}
                  placeholder="https://img.scribes.ff.cuni.cz/.../folio.jpg"
                  className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9c8976] mb-1">
                    Signatura rukopisu *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.shelfmark}
                    onChange={(e) => setNewForm({ ...newForm, shelfmark: e.target.value })}
                    placeholder="Např. CO 340"
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9c8976] mb-1">Folio (locus) *</label>
                  <input
                    type="text"
                    required
                    value={newForm.locus}
                    onChange={(e) => setNewForm({ ...newForm, locus: e.target.value })}
                    placeholder="Např. 193r"
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9c8976] mb-1">
                  Původní text kolofonu (latinsky) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newForm.quote}
                  onChange={(e) => setNewForm({ ...newForm, quote: e.target.value })}
                  placeholder="Explicit liber..."
                  className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9c8976] mb-1">
                  Český překlad (volitelné)
                </label>
                <textarea
                  rows={2}
                  value={newForm.translation}
                  onChange={(e) => setNewForm({ ...newForm, translation: e.target.value })}
                  placeholder="Kniha je dokončena..."
                  className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9c8976] mb-1">Písař</label>
                  <input
                    type="text"
                    value={newForm.scribe}
                    onChange={(e) => setNewForm({ ...newForm, scribe: e.target.value })}
                    placeholder="Neznámý písař"
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9c8976] mb-1">Místo</label>
                  <input
                    type="text"
                    value={newForm.place}
                    onChange={(e) => setNewForm({ ...newForm, place: e.target.value })}
                    placeholder="Praha"
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9c8976] mb-1">Rok</label>
                  <input
                    type="number"
                    value={newForm.year}
                    onChange={(e) => setNewForm({ ...newForm, year: Number(e.target.value) })}
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-[#9c8976] mb-1">Název karty</label>
                  <input
                    type="text"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    placeholder="Např. Hlas z kláštera"
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9c8976] mb-1">Rarita</label>
                  <select
                    value={newForm.rarity}
                    onChange={(e) => setNewForm({ ...newForm, rarity: e.target.value as Rarity })}
                    className="w-full bg-[#14110f] border border-[#3b322a] rounded px-2 py-1 text-xs"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Unique">Unique</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#2e2721]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded text-[#9c8976] hover:bg-[#231d18]"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#d4af37] text-black font-bold px-4 py-1.5 rounded hover:bg-[#c39e2e] transition disabled:opacity-50"
                >
                  {saving ? "Ukládám..." : "Vytvořit a otevřít k ořezu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
