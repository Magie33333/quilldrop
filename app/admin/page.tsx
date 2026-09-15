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
  Smile,
  ScrollText,
  Sparkles,
  HelpCircle,
  Trash2,
  BookOpen,
  Puzzle,
  Flame,
  Upload,
  Image as ImageIcon,
  Radio,
} from "lucide-react";
import { HEURIST_COLOPHONS } from "../data/colophons.generated";
import { DEFAULT_CURIOS, type Curio } from "../data/curios";
import {
  DEFAULT_ILLUMINATIONS,
  type IlluminationMosaicItem,
  type IlluminationRarity,
  getStoredIlluminations,
  saveStoredIlluminations,
} from "../data/illuminations";
import HeuristCatalogModal from "./HeuristCatalogModal";
import StudioHelpModal from "./StudioHelpModal";

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
  created_by?: string | null;
  created_by_name?: string | null;
  updated_by?: string | null;
  updated_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
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
  options: any;
  correct_index: number;
  explanation: string;
  hint: string;
  difficulty: "easy" | "medium" | "expert";
  mode?: "mood" | "cipher" | "script" | "century" | "transcription";
  translation_cs?: string;
  target_transcription?: string;
  accepted_variants?: string[];
  highlight_regions?: { x: number; y: number; w: number; h: number; line_number?: number }[];
};

function isCipherCard(card: CardData): boolean {
  if (card.colophons?.heurist_id) {
    const h = HEURIST_COLOPHONS.find((item) => item.id === card.colophons?.heurist_id);
    if (h && ((h.features as any)?.includes("cipher or wordplay") || h.rarityReason?.toLowerCase().includes("cipher"))) {
      return true;
    }
  }
  const text = `${card.title} ${card.rarity_reason || ""} ${card.colophons?.quote || ""} ${card.colophons?.visual_note || ""}`.toLowerCase();
  return text.includes("cipher") || text.includes("šifr") || text.includes("tajemn") || text.includes("krypt");
}

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

  // Kolaborace a Realtime Presence (prevence kolizí při editaci stejné karty)
  type PresenceUser = {
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
    cardId: string | null;
    cardTitle: string | null;
    onlineSince: string;
  };
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const presenceChannelRef = useRef<any>(null);

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

  // Minihry: Tvůrce výzev pro tým (4 herní režimy)
  type GameBuilderMode = "mood" | "cipher" | "script" | "transcription";
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [showGameForm, setShowGameForm] = useState(false);
  const [builderMode, setBuilderMode] = useState<GameBuilderMode>("mood");
  const [builderTitle, setBuilderTitle] = useState("Nálada písaře");
  const [builderIntro, setBuilderIntro] = useState("Jak se písař cítil při psaní tohoto kolofonu?");
  const [builderQuote, setBuilderQuote] = useState("");
  const [builderTranslation, setBuilderTranslation] = useState("");
  const [builderExplanation, setBuilderExplanation] = useState("");
  const [builderHint, setBuilderHint] = useState("");
  const [builderDifficulty, setBuilderDifficulty] = useState<"easy" | "medium" | "expert">("easy");
  const [builderOptions, setBuilderOptions] = useState<[string, string][]>([
    ["😌", "Úleva a vděčnost za dokončení díla"],
    ["🍺", "Touha po dobrém vínu či pivu a odpočinku"],
    ["✍️", "Bolest ruky a tělesná únava"],
    ["😡", "Rozladění a hněv na nekvalitní pergamen"],
  ]);
  const [builderCorrectIndex, setBuilderCorrectIndex] = useState(0);
  const [builderTargetTranscription, setBuilderTargetTranscription] = useState("");
  const [builderAcceptedVariants, setBuilderAcceptedVariants] = useState("");
  const [builderStrips, setBuilderStrips] = useState<{ x: number; y: number; w: number; h: number; line_number?: number }[]>([
    { x: 10, y: 70, w: 80, h: 8, line_number: 1 },
  ]);

  // Vizuální interaktivní vyznačení řádků (Studio Spotlight na velkém rukopisu)
  const [centerMode, setCenterMode] = useState<"crop" | "strips">("crop");
  const [rightSidebarTab, setRightSidebarTab] = useState<"card" | "minigames">("card");
  const [activeStripIdx, setActiveStripIdx] = useState<number>(0);
  const stripContainerRef = useRef<HTMLDivElement>(null);
  const [stripDrag, setStripDrag] = useState<{
    action: "move" | "resize-se" | "resize-e" | "resize-s";
    stripIdx: number;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
  } | null>(null);

  useEffect(() => {
    if (!stripDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!stripContainerRef.current) return;
      const rect = stripContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const deltaPctX = ((e.clientX - stripDrag.startX) / rect.width) * 100;
      const deltaPctY = ((e.clientY - stripDrag.startY) / rect.height) * 100;

      setBuilderStrips((prev) => {
        const next = [...prev];
        const cur = next[stripDrag.stripIdx];
        if (!cur) return prev;

        if (stripDrag.action === "move") {
          const maxLeft = 100 - cur.w;
          const maxTop = 100 - cur.h;
          const nx = Math.max(0, Math.min(maxLeft, stripDrag.initX + deltaPctX));
          const ny = Math.max(0, Math.min(maxTop, stripDrag.initY + deltaPctY));
          next[stripDrag.stripIdx] = { ...cur, x: Math.round(nx * 10) / 10, y: Math.round(ny * 10) / 10 };
        } else if (stripDrag.action === "resize-se") {
          const nw = Math.max(8, Math.min(100 - cur.x, stripDrag.initW + deltaPctX));
          const nh = Math.max(3, Math.min(100 - cur.y, stripDrag.initH + deltaPctY));
          next[stripDrag.stripIdx] = { ...cur, w: Math.round(nw * 10) / 10, h: Math.round(nh * 10) / 10 };
        } else if (stripDrag.action === "resize-e") {
          const nw = Math.max(8, Math.min(100 - cur.x, stripDrag.initW + deltaPctX));
          next[stripDrag.stripIdx] = { ...cur, w: Math.round(nw * 10) / 10 };
        } else if (stripDrag.action === "resize-s") {
          const nh = Math.max(3, Math.min(100 - cur.y, stripDrag.initH + deltaPctY));
          next[stripDrag.stripIdx] = { ...cur, h: Math.round(nh * 10) / 10 };
        }
        return next;
      });
    };

    const handlePointerUp = () => {
      setStripDrag(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [stripDrag]);

  // Přidání nového kolofonu (Heurist katalog / ruční zadání)
  const [showNewModal, setShowNewModal] = useState(false);

  // Správa historických glos a mouder ze skriptoria
  const [curios, setCurios] = useState<Curio[]>(DEFAULT_CURIOS);
  const [showCuriosModal, setShowCuriosModal] = useState(false);
  const [curioSearch, setCurioSearch] = useState("");
  const [curioCategoryFilter, setCurioCategoryFilter] = useState("Vše");
  const [editingCurio, setEditingCurio] = useState<Curio | null>(null);
  const [curioSuccessMsg, setCurioSuccessMsg] = useState("");
  const [curioForm, setCurioForm] = useState<{
    id: string;
    category: string;
    title: string;
    text: string;
    source: string;
  }>({
    id: "",
    category: "Písařské stížnosti",
    title: "",
    text: "",
    source: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("quilldrop-curios");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setCurios(parsed);
        }
      } catch {}
    }
    async function loadCurios() {
      try {
        const { data, error } = await supabase
          .from("scriptorium_curios")
          .select("*")
          .order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          setCurios(data as Curio[]);
          if (typeof window !== "undefined") {
            localStorage.setItem("quilldrop-curios", JSON.stringify(data));
          }
        }
      } catch {}
    }
    loadCurios();
  }, []);

  const handleSelectCurioToEdit = (c: Curio) => {
    setEditingCurio(c);
    setCurioForm({
      id: c.id,
      category: c.category || "Písařské stížnosti",
      title: c.title || "",
      text: c.text || "",
      source: c.source || "",
    });
    setCurioSuccessMsg("");
  };

  const handleNewCurioForm = () => {
    setEditingCurio(null);
    setCurioForm({
      id: "",
      category: "Písařské stížnosti",
      title: "",
      text: "",
      source: "",
    });
    setCurioSuccessMsg("");
  };

  const handleSaveCurio = async () => {
    if (!curioForm.title.trim() || !curioForm.text.trim()) return;
    const isNew = !curioForm.id;
    const curioId = curioForm.id || `curio-${Date.now()}`;
    const newCurio: Curio = {
      id: curioId,
      category: curioForm.category.trim() || "Zajímavost",
      title: curioForm.title.trim(),
      text: curioForm.text.trim(),
      source: curioForm.source.trim() || undefined,
    };

    const nextList = isNew
      ? [newCurio, ...curios]
      : curios.map((c) => (c.id === curioId ? newCurio : c));

    setCurios(nextList);
    if (typeof window !== "undefined") {
      localStorage.setItem("quilldrop-curios", JSON.stringify(nextList));
    }
    setEditingCurio(newCurio);
    setCurioForm({
      id: newCurio.id,
      category: newCurio.category,
      title: newCurio.title,
      text: newCurio.text,
      source: newCurio.source || "",
    });
    setCurioSuccessMsg(isNew ? "Nová glosa byla úspěšně vytvořena!" : "Změny v glose byly uloženy!");
    setTimeout(() => setCurioSuccessMsg(""), 3000);

    // Supabase sync (pokud tabulka existuje)
    try {
      await supabase.from("scriptorium_curios").upsert(newCurio);
    } catch {}
  };

  const handleDeleteCurio = async (id: string) => {
    if (!confirm("Opravdu chcete tuto glosu odstranit?")) return;
    const nextList = curios.filter((c) => c.id !== id);
    setCurios(nextList);
    if (typeof window !== "undefined") {
      localStorage.setItem("quilldrop-curios", JSON.stringify(nextList));
    }
    if (editingCurio?.id === id) {
      handleNewCurioForm();
    }
    try {
      await supabase.from("scriptorium_curios").delete().eq("id", id);
    } catch {}
  };

  const handleResetCuriosToDefault = () => {
    if (confirm("Opravdu chcete obnovit všechny glosy na výchozí historický katalog?")) {
      setCurios(DEFAULT_CURIOS);
      if (typeof window !== "undefined") {
        localStorage.setItem("quilldrop-curios", JSON.stringify(DEFAULT_CURIOS));
      }
      handleNewCurioForm();
    }
  };

  // Správa 16dílných iluminací a denních streaků (Cesta písaře)
  const [illuminations, setIlluminations] = useState<IlluminationMosaicItem[]>(DEFAULT_ILLUMINATIONS);
  const [showMosaicsModal, setShowMosaicsModal] = useState(false);
  const [mosaicSearch, setMosaicSearch] = useState("");
  const [mosaicRarityFilter, setMosaicRarityFilter] = useState("Vše");
  const [editingMosaic, setEditingMosaic] = useState<IlluminationMosaicItem | null>(null);
  const [mosaicSuccessMsg, setMosaicSuccessMsg] = useState("");
  const [previewPieces, setPreviewPieces] = useState(8); // Posuvník pro živý 16dílný řez
  const [mosaicForm, setMosaicForm] = useState<{
    id: string;
    cycle: number;
    title: string;
    source: string;
    origin: string;
    century: string;
    tierName: string;
    rarity: IlluminationRarity;
    description: string;
    rewardXp: number;
    rewardPack: "standard" | "refined" | "masterwork";
  }>({
    id: "",
    cycle: 1,
    title: "",
    source: "",
    origin: "",
    century: "",
    tierName: "Cyklus učedníka (Dny 1–16)",
    rarity: "Common",
    description: "",
    rewardXp: 150,
    rewardPack: "standard",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIlluminations(getStoredIlluminations());
    }
  }, []);

  const handleSelectMosaicToEdit = (m: IlluminationMosaicItem) => {
    setEditingMosaic(m);
    setMosaicForm({
      id: m.id,
      cycle: m.cycle || 1,
      title: m.title || "",
      source: m.source || "",
      origin: m.origin || "",
      century: m.century || "",
      tierName: m.tierName || "",
      rarity: m.rarity || "Common",
      description: m.description || "",
      rewardXp: m.rewardXp || 200,
      rewardPack: m.rewardPack || "standard",
    });
    setMosaicSuccessMsg("");
  };

  const handleNewMosaicForm = () => {
    const nextCycle = illuminations.length > 0 ? Math.max(...illuminations.map((i) => i.cycle)) + 1 : 1;
    const startDay = (nextCycle - 1) * 16 + 1;
    const endDay = nextCycle * 16;
    setEditingMosaic(null);
    setMosaicForm({
      id: "",
      cycle: nextCycle,
      title: "",
      source: "",
      origin: "",
      century: "",
      tierName: `Cyklus ${nextCycle} (Dny ${startDay}–${endDay})`,
      rarity: nextCycle >= 6 ? "Unique" : nextCycle === 5 ? "Legendary" : nextCycle === 4 ? "Epic" : nextCycle === 3 ? "Rare" : nextCycle === 2 ? "Uncommon" : "Common",
      description: "",
      rewardXp: nextCycle * 150,
      rewardPack: nextCycle >= 4 ? "masterwork" : nextCycle >= 2 ? "refined" : "standard",
    });
    setMosaicSuccessMsg("");
  };

  const handleSaveMosaic = () => {
    if (!mosaicForm.title.trim() || !mosaicForm.source.trim()) return;
    const isNew = !mosaicForm.id;
    const mosaicId = mosaicForm.id || `mosaic-${Date.now()}`;
    const newMosaic: IlluminationMosaicItem = {
      id: mosaicId,
      cycle: Number(mosaicForm.cycle) || 1,
      title: mosaicForm.title.trim(),
      source: mosaicForm.source.trim(),
      origin: mosaicForm.origin.trim() || "Neznámý rukopis",
      century: mosaicForm.century.trim() || "14. století",
      tierName: mosaicForm.tierName.trim() || `Cyklus ${mosaicForm.cycle}`,
      rarity: mosaicForm.rarity,
      description: mosaicForm.description.trim(),
      rewardXp: Number(mosaicForm.rewardXp) || 200,
      rewardPack: mosaicForm.rewardPack,
    };

    const nextList = (isNew
      ? [...illuminations, newMosaic]
      : illuminations.map((m) => (m.id === mosaicId ? newMosaic : m))
    ).sort((a, b) => a.cycle - b.cycle);

    setIlluminations(nextList);
    saveStoredIlluminations(nextList);

    setEditingMosaic(newMosaic);
    setMosaicForm({ ...newMosaic });
    setMosaicSuccessMsg(isNew ? "Nový cyklus iluminace byl zařazen do hry!" : "Změny v iluminaci byly úspěšně uloženy!");
    setTimeout(() => setMosaicSuccessMsg(""), 3000);
  };

  const handleDeleteMosaic = (id: string) => {
    if (!confirm("Opravdu chcete tento cyklus iluminace odstranit?")) return;
    const nextList = illuminations.filter((m) => m.id !== id);
    setIlluminations(nextList);
    saveStoredIlluminations(nextList);
    if (editingMosaic?.id === id) {
      handleNewMosaicForm();
    }
  };

  const handleResetMosaicsToDefault = () => {
    if (confirm("Opravdu chcete obnovit všechny iluminace na výchozí 6-cyklovou Cestu písaře?")) {
      setIlluminations(DEFAULT_ILLUMINATIONS);
      saveStoredIlluminations(DEFAULT_ILLUMINATIONS);
      handleNewMosaicForm();
    }
  };

  const handleMosaicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMosaicForm((prev) => ({
          ...prev,
          source: result,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        }));
        setMosaicSuccessMsg(`Obrázek „${file.name}“ byl úspěšně načten z počítače!`);
        setTimeout(() => setMosaicSuccessMsg(""), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

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

  // Supabase Realtime Presence - přehled online kolegů a prevence kolizí
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel("quilldrop-studio-presence", {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    presenceChannelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const usersList: PresenceUser[] = [];
        for (const key in state) {
          const list = state[key] as any[];
          if (list && list.length > 0) {
            usersList.push(list[0]);
          }
        }
        setOnlineUsers(usersList);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: currentUser.id,
            userName: currentProfile?.display_name || currentUser.email?.split("@")[0] || "Badatel",
            userEmail: currentUser.email || "",
            role: currentProfile?.role || "editor",
            cardId: selectedCard?.id || null,
            cardTitle: selectedCard?.title || null,
            onlineSince: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      presenceChannelRef.current = null;
    };
  }, [currentUser]);

  // Synchronizace aktuálně otevřené karty do Presence
  useEffect(() => {
    if (presenceChannelRef.current && currentUser) {
      presenceChannelRef.current.track({
        userId: currentUser.id,
        userName: currentProfile?.display_name || currentUser.email?.split("@")[0] || "Badatel",
        userEmail: currentUser.email || "",
        role: currentProfile?.role || "editor",
        cardId: selectedCard?.id || null,
        cardTitle: selectedCard?.title || null,
        onlineSince: new Date().toISOString(),
      });
    }
  }, [selectedCard?.id, currentProfile]);

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
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/admin" : undefined,
      },
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
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/admin" : undefined,
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
    if (data) {
      const parsed = data.map((q: any) => {
        let choices = q.options;
        let mode = q.game_kind;
        let highlightRegions = undefined;
        let targetTranscription = undefined;
        let acceptedVariants = undefined;
        let translationCs = q.translation_cs;

        if (q.options && typeof q.options === "object" && !Array.isArray(q.options)) {
          if (q.options.choices) choices = q.options.choices;
          if (q.options.mode) mode = q.options.mode;
          if (q.options.highlight_regions) highlightRegions = q.options.highlight_regions;
          if (q.options.target_transcription) targetTranscription = q.options.target_transcription;
          if (q.options.accepted_variants) acceptedVariants = q.options.accepted_variants;
          if (q.options.translation_cs) translationCs = q.options.translation_cs;
        }

        if (!mode) {
          if (highlightRegions || targetTranscription) mode = "transcription";
          else if (q.game_kind === "paleo") mode = "script";
          else mode = q.game_kind;
        }

        return {
          ...q,
          mode,
          options: choices || [],
          highlight_regions: highlightRegions,
          target_transcription: targetTranscription,
          accepted_variants: acceptedVariants,
          translation_cs: translationCs,
        };
      });
      setQuestions(parsed as GameQuestion[]);
    }
  }

  function applyBuilderMode(mode: GameBuilderMode, card: CardData | null) {
    setBuilderMode(mode);
    if (!card) return;
    const qText = card.colophons?.quote || "";
    const trText = card.colophons?.translation_cs || "";

    if (mode === "mood") {
      setBuilderTitle("Nálada písaře");
      setBuilderIntro("Jak se písař cítil při psaní tohoto kolofonu?");
      setBuilderDifficulty("easy");
      setBuilderQuote(qText);
      setBuilderTranslation(trText);
      setBuilderOptions([
        ["😌", "Úleva a vděčnost za dokončení díla"],
        ["🍺", "Touha po dobrém vínu či pivu a odpočinku"],
        ["✍️", "Bolest ruky a tělesná únava"],
        ["😡", "Rozladění a hněv na nekvalitní pergamen"],
      ]);
      setBuilderCorrectIndex(0);
      setBuilderExplanation("Písař vyjadřuje úlevu a radost z dokončení celého kodexu.");
      setBuilderHint("Sledujte zmínky o radosti z konce, či naopak o bolavých prstech a únavě.");
    } else if (mode === "cipher") {
      setBuilderTitle("Rozlušti šifru");
      setBuilderIntro("Odhalte zašifrovaný text nebo skryté jméno písaře:");
      setBuilderDifficulty("medium");
      setBuilderQuote(qText);
      setBuilderTranslation(trText);
      setBuilderOptions([
        ["🔑", "Skryté jméno písaře v kryptogramu"],
        ["📜", "Zašifrovaný letopočet dokončení"],
        ["🏛️", "Tajné místo sepsání kodexu"],
        ["✝️", "Kletba na zloděje rukopisu"],
      ]);
      setBuilderCorrectIndex(0);
      setBuilderExplanation("Písař použil kryptografickou substituci nebo slovní hříčku.");
      setBuilderHint("Všímejte si neobvyklých znaků nebo vynechaných samohlásek.");
    } else if (mode === "script") {
      setBuilderTitle("Poznej středověké písmo");
      setBuilderIntro("Určete, jakým typem písma je tento kolofon zapsán:");
      setBuilderDifficulty("medium");
      setBuilderQuote(qText);
      setBuilderTranslation(trText);
      setBuilderOptions([
        ["📜", "Gotická textura (formalis)"],
        ["✒️", "Gotická bastarda"],
        ["🖋️", "Gotická kurzíva (notula)"],
        ["🏛️", "Humanistická antikva"],
      ]);
      setBuilderCorrectIndex(1);
      setBuilderExplanation("Charakteristické lámání dříků a duktus odpovídají gotické bastardě.");
      setBuilderHint("Zaměřte se na ostrost lomení písmen a přítomnost smyček.");
    } else if (mode === "transcription") {
      setBuilderTitle("Paleografický mistr");
      setBuilderIntro("Přepište označené řádky rukopisu s lupou přesně podle originálu:");
      setBuilderDifficulty("expert");
      setBuilderQuote(qText);
      setBuilderTranslation(trText);
      setBuilderTargetTranscription(qText.split("\n")[0] || qText);
      setBuilderAcceptedVariants("");
      setBuilderStrips([
        { x: 10, y: 70, w: 80, h: 8, line_number: 1 },
      ]);
      setCenterMode("strips");
      setActiveStripIdx(0);
      setBuilderExplanation("Správný latinský přepis včetně rozvedených zkratek a ligatur.");
      setBuilderHint("Pozor na záměnu písmen u/v, dlouhé 's' a zkracovací vlnovky.");
    }
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

    const editorName =
      currentProfile?.display_name ||
      currentUser?.email?.split("@")[0] ||
      "Editor";

    const updatePayload: any = {
      title: editTitle,
      rarity: editRarity,
      rarity_reason: editRarityReason,
      status: editStatus,
      crop_x: pctX,
      crop_y: pctY,
      crop_w: pctW,
      crop_h: pctH,
      updated_by_name: editorName,
      updated_by: currentUser?.id || null,
    };

    let { error: cardErr } = await supabase
      .from("cards")
      .update(updatePayload)
      .eq("id", selectedCard.id);

    // Pokud ještě sloupce v Supabase nebyly přidány migrací, zopakujeme bez nich
    if (cardErr && (cardErr.code === "PGRST204" || cardErr.message?.includes("updated_by"))) {
      delete updatePayload.updated_by;
      delete updatePayload.updated_by_name;
      const retry = await supabase
        .from("cards")
        .update(updatePayload)
        .eq("id", selectedCard.id);
      cardErr = retry.error;
    }

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


  async function handleAddGame() {
    if (!selectedCard) return;

    // Postgres CHECK (game_kind IN ('mood', 'cipher', 'paleo'))
    const dbGameKind =
      builderMode === "mood" ? "mood" :
      builderMode === "cipher" ? "cipher" : "paleo";

    const optionsPayload = {
      choices: builderOptions,
      mode: builderMode,
      highlight_regions: builderMode === "transcription" ? builderStrips : undefined,
      target_transcription: builderMode === "transcription" ? builderTargetTranscription.trim() : undefined,
      accepted_variants:
        builderMode === "transcription" && builderAcceptedVariants.trim()
          ? builderAcceptedVariants.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      translation_cs: builderTranslation.trim() || undefined,
    };

    const toInsert = {
      card_id: selectedCard.id,
      game_kind: dbGameKind,
      title: builderTitle.trim(),
      intro: builderIntro.trim(),
      quote: builderQuote.trim() || selectedCard.colophons?.quote || "",
      options: optionsPayload,
      correct_index: builderCorrectIndex,
      explanation: builderExplanation.trim(),
      hint: builderHint.trim(),
      difficulty: builderDifficulty,
      is_active: true,
    };

    const { data, error } = await supabase.from("game_questions").insert(toInsert).select().single();
    if (!error && data) {
      setQuestions([
        ...questions,
        {
          ...data,
          mode: builderMode,
          highlight_regions: optionsPayload.highlight_regions,
          target_transcription: optionsPayload.target_transcription,
          accepted_variants: optionsPayload.accepted_variants,
          translation_cs: optionsPayload.translation_cs,
          options: builderOptions,
        } as any,
      ]);
      setShowGameForm(false);
    } else {
      alert("Chyba při ukládání minihry do Supabase: " + (error?.message || "Neznámá chyba"));
    }
  }

  async function handleDeleteGame(qId: string) {
    if (!confirm("Opravdu chcete tuto minihru smazat?")) return;
    const { error } = await supabase.from("game_questions").delete().eq("id", qId);
    if (!error) {
      setQuestions(questions.filter((q) => q.id !== qId));
    } else {
      alert("Chyba při mazání minihry: " + error.message);
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

  // Uživatelé v reálném čase editující stejnou kartu (detekce kolizí)
  const editorsOnCurrentCard = onlineUsers.filter(
    (u) => u.userId !== currentUser?.id && selectedCard && u.cardId === selectedCard.id
  );

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
    <div className="h-screen max-h-screen bg-[#110f0d] text-[#e8ded1] flex flex-col font-sans overflow-hidden">
      {/* HORNÍ LIŠTA: Zpřehledněné Studio (3 logické zóny) */}
      <header className="border-b border-[#2e2721] bg-[#171310] px-5 py-2.5 flex items-center justify-between shrink-0 shadow-md">
        {/* LEVÁ ČÁST: Navigace a název */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#c9a96e] hover:text-[#ffd580] bg-[#231c16] hover:bg-[#2e241c] px-3 py-1.5 rounded-lg border border-[#423425] transition font-medium cursor-pointer"
          >
            <ArrowLeft size={14} /> Zpět do hry
          </a>
          <span className="text-[#3d3122]">|</span>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base sm:text-lg text-[#ffd580] tracking-wide">
              Quilldrop Studio
            </span>
            <span className="text-[10px] uppercase font-bold text-[#c9a96e] bg-[#241c16] px-2 py-0.5 rounded border border-[#423425] tracking-wider">
              Redakční studio
            </span>
          </div>
        </div>

        {/* STŘEDNÍ ČÁST: Nástroje a akce */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 text-xs bg-[#d4af37] hover:bg-[#c39e2e] text-[#14100c] px-3.5 py-1.5 rounded-lg font-bold shadow transition cursor-pointer"
            title="Přidat nový kolofon z 3 640 digitalizátů Heurist"
          >
            <PlusCircle size={14} /> + Přidat kolofon (Heurist)
          </button>

          <button
            onClick={() => {
              setShowCuriosModal(true);
              setEditingCurio(null);
            }}
            className="flex items-center gap-1.5 text-xs bg-[#241c16] hover:bg-[#30261e] text-[#c9a96e] hover:text-[#ffd580] px-3 py-1.5 rounded-lg border border-[#423425] cursor-pointer transition font-medium"
            title="Správa historických glos, mouder a zajímavostí z knižní kultury"
          >
            <BookOpen size={13} /> Glosy & moudra ({curios.length})
          </button>

          <button
            onClick={() => {
              setShowMosaicsModal(true);
              setEditingMosaic(null);
            }}
            className="flex items-center gap-1.5 text-xs bg-[#241c16] hover:bg-[#30261e] text-[#c9a96e] hover:text-[#ffd580] px-3 py-1.5 rounded-lg border border-[#423425] cursor-pointer transition font-medium"
            title="Správa 16dílných iluminací a denních streaků (Cesta písaře)"
          >
            <Puzzle size={13} /> Iluminace & streaky ({illuminations.length})
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 text-xs bg-[#2e2316] hover:bg-[#3d301f] text-[#ffd580] px-3 py-1.5 rounded-lg border border-[#5c4627] cursor-pointer transition font-medium shadow-xs"
            title="Metodická příručka pro editory a instrukce od prof. Lucie Doležalové"
          >
            <HelpCircle size={14} className="text-[#ffd580]" /> Příručka editora
          </button>
        </div>

        {/* PRAVÁ ČÁST: Tým, Uživatel a Uložení */}
        <div className="flex items-center gap-2.5">
          {/* Realtime indikátor přítomnosti týmu */}
          <button
            onClick={() => setShowPresenceModal(true)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              onlineUsers.length > 1
                ? "bg-emerald-950/80 border-emerald-700/80 text-emerald-300 font-semibold shadow-xs"
                : "bg-[#241c16] border-[#423425] text-[#a89887] hover:text-[#e8ded1] hover:bg-[#30261e]"
            }`}
            title="Aktivní badatelé a editoři online v reálném čase"
          >
            <span className="flex h-2 w-2 relative">
              <span className={`inline-flex h-full w-full rounded-full ${onlineUsers.length > 1 ? "animate-ping bg-emerald-400 opacity-75 absolute" : ""}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${onlineUsers.length > 1 ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
            </span>
            <Users size={13} />
            <span className="hidden sm:inline">Tým online</span> ({onlineUsers.length || 1})
          </button>

          {currentProfile?.role === "admin" && (
            <button
              onClick={fetchTeam}
              className="flex items-center gap-1.5 text-xs bg-[#241c16] hover:bg-[#30261e] text-[#c9a96e] px-2.5 py-1.5 rounded-lg border border-[#423425] cursor-pointer transition font-medium"
              title="Správa uživatelských účtů a rolí"
            >
              <Shield size={13} /> Účty ({teamProfiles.length || "..."})
            </button>
          )}

          {/* Uživatel a role */}
          <div className="hidden md:flex items-center gap-2 text-xs bg-[#1f1914] px-2.5 py-1 rounded-lg border border-[#382d20]">
            <span className="text-[#c9a96e] font-medium truncate max-w-[120px]">
              {currentProfile?.display_name || currentUser.email?.split("@")[0]}
            </span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                currentProfile?.role === "admin"
                  ? "bg-[#3d3120] text-[#ffd580] border-[#d4af37]"
                  : "bg-[#18232e] text-[#4a9eff] border-[#294a6e]"
              }`}
            >
              {currentProfile?.role === "admin" ? "Admin" : "Editor"}
            </span>
          </div>

          {noChangesNotice && (
            <span className="text-xs text-[#c9a96e] hidden sm:flex items-center gap-1 bg-[#29221b] px-2.5 py-1 rounded border border-[#52422b]">
              <AlertCircle size={14} className="text-[#ffd580]" /> Žádné změny
            </span>
          )}

          {saveSuccess && (
            <span className="text-xs text-[#73d13d] hidden sm:flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
              <Check size={14} /> {lastSavedSummary || "Uloženo"}
            </span>
          )}

          <button
            onClick={handleOpenSaveConfirmation}
            disabled={saving || !selectedCard}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c39e2e] text-[#14100c] font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
            title="Zkontrolovat a uložit změny do Supabase"
          >
            <Save size={14} />
            {saving ? "Ukládám..." : "Uložit změny"}
          </button>

          <button
            onClick={handleLogout}
            className="text-[#8c7b6d] hover:text-white p-1.5 rounded-lg hover:bg-[#2e261f] cursor-pointer transition"
            title="Odhlásit se ze Studia"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* HLAVNÍ PLOCHA */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEVÝ PANEL: Seznam karet */}
        <aside className="w-80 border-r border-[#2e2721] bg-[#14110f] flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-[#2e2721] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#c9a96e] uppercase tracking-wider block">
                  Katalog karet
                </span>
                <small className="text-[10px] text-[#7d6f62]">
                  {cards.length} ve hře · 3 640 v Heuristu
                </small>
              </div>
            </div>

            <input
              type="text"
              placeholder="Hledat kolofon, písaře..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1e1915] border border-[#3b322a] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37]"
            />
            <div className="flex gap-1 items-center flex-wrap">
              {[
                { id: "all", label: `Vše (${cards.length})` },
                { id: "published", label: `Publikováno (${cards.filter((c) => c.status === "published").length})`, dot: "bg-emerald-400" },
                { id: "review", label: `Ke kontrole (${cards.filter((c) => c.status === "review").length})`, dot: "bg-sky-400" },
                { id: "draft", label: `Koncepty (${cards.filter((c) => c.status === "draft").length})`, dot: "bg-amber-400" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 transition cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-[#3d3226] text-[#ffd580] font-semibold border border-[#5c4627]"
                      : "text-[#8c7b6d] hover:text-[#d1c2b4]"
                  }`}
                >
                  {st.dot && <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />}
                  {st.label}
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
              filteredCards.map((c) => {
                const otherEditor = onlineUsers.find(
                  (u) => u.userId !== currentUser?.id && u.cardId === c.id
                );
                return (
                  <button
                    key={c.id}
                    onClick={() => selectCard(c)}
                    className={`w-full text-left p-3 transition flex items-start gap-2.5 cursor-pointer relative ${
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
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold truncate text-[#e8ded1]">{c.title}</p>
                        {c.status === "published" && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
                            Publikováno
                          </span>
                        )}
                        {c.status === "review" && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 font-medium">
                            Ke kontrole
                          </span>
                        )}
                        {c.status === "draft" && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-medium">
                            Koncept
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9c8976] truncate italic mt-0.5">
                        {c.colophons?.quote || "Bez citátu"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#7d6f62] flex-wrap">
                        <span className="truncate max-w-[100px]">{c.colophons?.scribe || "Neznámý písař"}</span>
                        <span>•</span>
                        <span className="text-[#c9a96e]">{c.rarity}</span>
                        {isCipherCard(c) && (
                          <span className="bg-[#422915] text-[#ffd580] px-1 py-0.2 rounded border border-[#8a5b28] text-[9px] flex items-center gap-0.5">
                            <KeyRound size={9} /> Šifra
                          </span>
                        )}
                        {(c.created_by_name || c.updated_by_name) && (
                          <span
                            className="text-[#a89887] text-[9.5px] truncate max-w-[125px] flex items-center gap-1 bg-[#1a1410] px-1 py-0.2 rounded border border-[#382b1f]"
                            title={`Vytvořil: ${c.created_by_name || "Neznámý"}${c.updated_by_name ? ` · Naposledy upravil: ${c.updated_by_name}` : ""}`}
                          >
                            <PenTool size={8.5} className="text-[#d4af37]" />
                            {c.created_by_name || c.updated_by_name}
                          </span>
                        )}
                        {otherEditor && (
                          <span className="bg-rose-950/90 text-rose-300 border border-rose-700/80 px-1.5 py-0.2 rounded text-[9px] flex items-center gap-1 font-semibold animate-pulse">
                            <Users size={9} /> {otherEditor.userName || otherEditor.userEmail.split("@")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* STŘEDNÍ PANEL: Plnohodnotný PowerPoint-style ořez NEBO vizuální vyznačení řádků */}
        <main className="flex-1 bg-[#0a0908] flex flex-col min-h-0 overflow-hidden">
          {/* Upozornění na souběžnou editaci karty jiným členem týmu */}
          {editorsOnCurrentCard.length > 0 && (
            <div className="bg-[#2a1b12] border-b border-amber-600/70 px-4 py-2 flex items-center justify-between text-amber-200 text-xs shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <AlertCircle size={15} className="text-amber-400 shrink-0" />
                <span>
                  <strong className="text-amber-300">Pozor na kolizi:</strong> Na tomto kolofonu má právě otevřený editor{" "}
                  <span className="text-white font-bold underline bg-amber-900/60 px-1.5 py-0.5 rounded">
                    {editorsOnCurrentCard.map((u) => u.userName || u.userEmail.split("@")[0]).join(", ")}
                  </span>
                  . Pokud oba provedete změny, můžete si navzájem přepsat práci.
                </span>
              </div>
              <button
                onClick={() => fetchCards()}
                className="px-2.5 py-1 bg-[#3d2f1f] hover:bg-[#523f2b] text-[#ffd580] border border-[#70563b] rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0 ml-3 shadow-xs"
                title="Znovu načíst data karty ze serveru"
              >
                <RefreshCw size={12} /> Obnovit kartu
              </button>
            </div>
          )}

          <div className="p-2.5 border-b border-[#2e2721] bg-[#14110f] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              {centerMode === "crop" ? (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#ffd580] flex items-center gap-1.5">
                    <CropIcon size={14} className="text-[#d4af37]" /> Výřez karty (4:3)
                  </span>
                  <span className="text-[#8c7b6d] hidden md:inline text-[11px]">
                    (Táhněte za <b>rohy rámečku</b> pro změnu měřítka, uvnitř pro posun)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#ffd580] flex items-center gap-1.5">
                    <PenTool size={14} className="text-[#ffd580]" /> Vyznačení řádků k přepisu
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#14110f] text-[9.5px] border border-[#d4af37]/40 text-[#ffd580] font-mono">
                    {builderStrips.length}/3
                  </span>
                  <span className="text-[#c9a96e] hidden md:inline text-[11px] font-medium">
                    🎯 Klikněte a táhněte po rukopisu pro označení a posun řádků
                  </span>
                </div>
              )}
            </div>

            {centerMode === "crop" ? (
              <div className="flex items-center gap-2">
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
            ) : (
              <div className="flex items-center gap-2">
                {builderStrips.length < 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      const lastY = builderStrips[builderStrips.length - 1]?.y || 60;
                      const nextStrips = [
                        ...builderStrips,
                        {
                          x: 10,
                          y: Math.min(88, lastY + 11),
                          w: 80,
                          h: 8,
                          line_number: builderStrips.length + 1,
                        },
                      ];
                      setBuilderStrips(nextStrips);
                      setActiveStripIdx(nextStrips.length - 1);
                    }}
                    className="text-[11px] bg-[#2a2118] text-[#ffd580] hover:bg-[#3d3120] px-2.5 py-1 rounded border border-[#d4af37]/50 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <PlusCircle size={12} /> Přidat řádek ({builderStrips.length}/3)
                  </button>
                )}
                {builderStrips.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStrips = builderStrips.filter((_, i) => i !== activeStripIdx);
                      setBuilderStrips(nextStrips);
                      setActiveStripIdx(Math.max(0, activeStripIdx - 1));
                    }}
                    className="text-[11px] text-[#ff7878] hover:text-[#ff9999] px-2 py-1 bg-[#241515] rounded border border-[#522424] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} /> Smazat #{activeStripIdx + 1}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const nextStrips = [...builderStrips];
                    if (nextStrips[activeStripIdx]) {
                      nextStrips[activeStripIdx] = {
                        ...nextStrips[activeStripIdx],
                        x: 10,
                        w: 80,
                        h: 8,
                      };
                      setBuilderStrips(nextStrips);
                    }
                  }}
                  className="text-[11px] text-[#b39e87] hover:text-[#e8ded1] px-2 py-1 bg-[#231d18] rounded border border-[#3b322a] flex items-center gap-1 cursor-pointer"
                  title="Nastavit standardní šířku 80 % a výšku 8 %"
                >
                  <RotateCcw size={12} /> Standardní rozměr
                </button>
                <button
                  type="button"
                  onClick={() => setCenterMode("crop")}
                  className="text-[11px] bg-[#22351f] text-[#86efac] hover:bg-[#2c4728] px-3 py-1 rounded border border-[#4ade80]/50 flex items-center gap-1.5 cursor-pointer font-bold transition shadow"
                  title="Dokončit vyznačení řádků a vrátit se na náhled výřezu karty"
                >
                  <Check size={13} /> Hotovo (Zpět na výřez)
                </button>
              </div>
            )}
          </div>

          {/* PLÁTNO: OŘEZ (ReactCrop) NEBO VIZUÁLNÍ OZNAČENÍ ŘÁDKŮ */}
          <div className="flex-1 min-h-0 overflow-hidden p-3 flex items-center justify-center relative select-none">
            {centerMode === "crop" ? (
              selectedCard ? (
                <div className="max-w-full max-h-full border border-[#3d3226] shadow-2xl bg-[#14110f] flex items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(c, percentCrop) => {
                      setCrop(percentCrop);
                    }}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={lockRatio ? 4 / 3 : undefined}
                    minWidth={80}
                    minHeight={60}
                    className="max-h-[calc(100vh-130px)]"
                  >
                    <img
                      ref={imgRef}
                      src={selectedCard.image_url}
                      alt="Folio rukopisu"
                      onLoad={onImageLoad}
                      className="max-h-[calc(100vh-130px)] max-w-full w-auto h-auto object-contain block select-none"
                    />
                  </ReactCrop>
                </div>
              ) : (
                <p className="text-xs text-[#7d6f62]">Vyberte kartu vlevo pro úpravu výřezu.</p>
              )
            ) : (
              selectedCard ? (
                <div className="flex flex-col items-center gap-3 max-w-full max-h-full">
                  <div
                    ref={stripContainerRef}
                    onPointerDown={(e) => {
                      if (!stripContainerRef.current) return;
                      const rect = stripContainerRef.current.getBoundingClientRect();
                      const clickX = Math.max(0, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
                      const clickY = Math.max(0, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

                      if (builderStrips.length < 3) {
                        const newIdx = builderStrips.length;
                        const initialWidth = 75;
                        const initialHeight = 8;
                        const startX = Math.max(2, Math.min(100 - initialWidth, clickX - 10));
                        const newStrip = {
                          x: Math.round(startX * 10) / 10,
                          y: Math.round(clickY * 10) / 10,
                          w: initialWidth,
                          h: initialHeight,
                          line_number: newIdx + 1,
                        };
                        setBuilderStrips([...builderStrips, newStrip]);
                        setActiveStripIdx(newIdx);
                        setStripDrag({
                          action: "move",
                          stripIdx: newIdx,
                          startX: e.clientX,
                          startY: e.clientY,
                          initX: startX,
                          initY: clickY,
                          initW: initialWidth,
                          initH: initialHeight,
                        });
                      } else {
                        const curIdx = activeStripIdx < builderStrips.length ? activeStripIdx : 0;
                        const cur = builderStrips[curIdx];
                        const newY = Math.max(0, Math.min(100 - cur.h, clickY));
                        const next = [...builderStrips];
                        next[curIdx] = { ...cur, y: Math.round(newY * 10) / 10 };
                        setBuilderStrips(next);
                        setStripDrag({
                          action: "move",
                          stripIdx: curIdx,
                          startX: e.clientX,
                          startY: e.clientY,
                          initX: cur.x,
                          initY: newY,
                          initW: cur.w,
                          initH: cur.h,
                        });
                      }
                    }}
                    className="relative border border-[#4a3928] shadow-2xl bg-[#0f0d0b] max-h-[calc(100vh-130px)] select-none cursor-crosshair overflow-hidden"
                  >
                    <img
                      src={selectedCard.image_url}
                      alt="Folio pro vyznačení řádků"
                      className="max-h-[calc(100vh-130px)] max-w-full w-auto h-auto object-contain block pointer-events-none select-none"
                    />

                    {/* Tmavá iluminovaná maska přes rukopis */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <mask id="admin-interactive-mask">
                          <rect x="0" y="0" width="100" height="100" fill="white" />
                          {builderStrips.map((st, i) => (
                            <rect
                              key={i}
                              x={st.x}
                              y={st.y}
                              width={st.w}
                              height={st.h}
                              fill="black"
                              rx="0.5"
                            />
                          ))}
                        </mask>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        fill="rgba(0,0,0,0.68)"
                        mask="url(#admin-interactive-mask)"
                      />
                    </svg>

                    {/* Interaktivní obdélníky jednotlivých řádků */}
                    {builderStrips.map((st, idx) => {
                      const isActive = activeStripIdx === idx;
                      return (
                        <div
                          key={idx}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveStripIdx(idx);
                            setStripDrag({
                              action: "move",
                              stripIdx: idx,
                              startX: e.clientX,
                              startY: e.clientY,
                              initX: st.x,
                              initY: st.y,
                              initW: st.w,
                              initH: st.h,
                            });
                          }}
                          style={{
                            left: `${st.x}%`,
                            top: `${st.y}%`,
                            width: `${st.w}%`,
                            height: `${st.h}%`,
                          }}
                          className={`absolute border-2 transition-colors cursor-move flex items-center justify-between ${
                            isActive
                              ? "border-[#ffd580] bg-[#ffd580]/20 shadow-[0_0_18px_rgba(255,213,128,0.5)] z-20"
                              : "border-[#d4af37]/60 border-dashed bg-[#ffd580]/5 hover:border-[#ffd580] z-10"
                          }`}
                        >
                          {/* Odznáček s číslem řádku */}
                          <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#1c150e] border border-[#ffd580] text-[9.5px] font-bold text-[#ffd580] flex items-center gap-1 shadow pointer-events-none">
                            <span>#{st.line_number || idx + 1}</span>
                            <span className="opacity-80 font-mono text-[8.5px]">
                              {Math.round(st.w)}% × {Math.round(st.h)}%
                            </span>
                          </div>

                          {/* Úchyty pro změnu velikosti (zobrazeny pro aktivní řádek) */}
                          {isActive && (
                            <>
                              {/* Pravý úchyt (šířka) */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setActiveStripIdx(idx);
                                  setStripDrag({
                                    action: "resize-e",
                                    stripIdx: idx,
                                    startX: e.clientX,
                                    startY: e.clientY,
                                    initX: st.x,
                                    initY: st.y,
                                    initW: st.w,
                                    initH: st.h,
                                  });
                                }}
                                className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-[#ffd580]/40 flex items-center justify-center"
                                title="Změnit šířku řádku"
                              >
                                <div className="w-1 h-3.5 bg-[#ffd580] rounded-full" />
                              </div>

                              {/* Spodní úchyt (výška) */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setActiveStripIdx(idx);
                                  setStripDrag({
                                    action: "resize-s",
                                    stripIdx: idx,
                                    startX: e.clientX,
                                    startY: e.clientY,
                                    initX: st.x,
                                    initY: st.y,
                                    initW: st.w,
                                    initH: st.h,
                                  });
                                }}
                                className="absolute left-0 right-0 bottom-0 h-3 cursor-ns-resize hover:bg-[#ffd580]/40 flex items-center justify-center"
                                title="Změnit výšku řádku"
                              >
                                <div className="w-4 h-1 bg-[#ffd580] rounded-full" />
                              </div>

                              {/* Jihovýchodní rohový úchyt (šířka i výška současně) */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setActiveStripIdx(idx);
                                  setStripDrag({
                                    action: "resize-se",
                                    stripIdx: idx,
                                    startX: e.clientX,
                                    startY: e.clientY,
                                    initX: st.x,
                                    initY: st.y,
                                    initW: st.w,
                                    initH: st.h,
                                  });
                                }}
                                className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-[#ffd580] border border-[#1a120b] rounded cursor-nwse-resize shadow"
                                title="Táhněte za roh pro změnu velikosti"
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pomocný proužek pod plátnem */}
                  <div className="text-[11px] text-[#b39e87] flex flex-wrap items-center justify-center gap-4 bg-[#14110f] px-3.5 py-1.5 rounded border border-[#2e2721]">
                    <span>
                      🖱️ <b>Posun:</b> uchopte řádek a táhněte
                    </span>
                    <span>
                      📐 <b>Velikost:</b> táhněte za roh nebo úchyty po stranách
                    </span>
                    <span>
                      ➕ <b>Nový řádek:</b> klikněte na volné místo na rukopisu
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#7d6f62]">Vyberte kartu vlevo pro vyznačení řádků.</p>
              )
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
        <aside className="w-96 xl:w-[440px] shrink-0 border-l border-[#2e2721] bg-[#161310] flex flex-col min-h-0 overflow-y-auto">
          {selectedCard && (
            <div className="flex flex-col min-h-0 flex-1">
              {/* ZÁLOŽKY: Karta a výřez VS Písařské výzvy */}
              <div className="flex border-b border-[#2e2721] bg-[#1a1613] p-1 gap-1 sticky top-0 z-30 shadow-md shrink-0">
                <button
                  type="button"
                  onClick={() => setRightSidebarTab("card")}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightSidebarTab === "card"
                      ? "bg-[#3d3120] text-[#ffd580] border border-[#d4af37]/40 shadow"
                      : "text-[#8c7b6d] hover:text-[#e8ded1] hover:bg-[#241e19]"
                  }`}
                >
                  <Eye size={13} /> 🎴 Karta a výřez
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRightSidebarTab("minigames");
                    if (!showGameForm && questions.length === 0) {
                      setShowGameForm(true);
                      applyBuilderMode("mood", selectedCard);
                    }
                  }}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightSidebarTab === "minigames"
                      ? "bg-[#3d3120] text-[#ffd580] border border-[#d4af37]/40 shadow"
                      : "text-[#8c7b6d] hover:text-[#e8ded1] hover:bg-[#241e19]"
                  }`}
                >
                  <Sparkles size={13} /> 🎮 Písařské výzvy
                  <span className="px-1.5 py-0.2 rounded-full bg-[#14110f] text-[9.5px] border border-[#d4af37]/40 text-[#ffd580] font-mono">
                    {questions.length}
                  </span>
                </button>
              </div>

              <div className="p-4 space-y-6 flex-1">
                {rightSidebarTab === "card" ? (
                  <>
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

                {/* Informace o autorovi a historii úprav */}
                <div className="bg-[#1a140f] border border-[#3b2f21] rounded-lg p-3 space-y-2 text-xs text-[#c9a96e]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#ffd580] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Shield size={12} className="text-[#d4af37]" /> Autorství karty
                    </span>
                    {selectedCard.status === "published" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1">
                        🟢 Publikováno
                      </span>
                    )}
                    {selectedCard.status === "review" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 font-bold flex items-center gap-1">
                        🔵 Ke kontrole
                      </span>
                    )}
                    {selectedCard.status === "draft" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold flex items-center gap-1">
                        🟡 Koncept
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px] border-t border-[#2d2318]">
                    <div>
                      <span className="text-[#7d6f62] block text-[10px]">Vytvořil editor:</span>
                      <span className="text-[#e8ded1] font-semibold truncate block" title={selectedCard.created_by_name || "Původní import"}>
                        {selectedCard.created_by_name || "Původní import"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7d6f62] block text-[10px]">Naposledy upravil:</span>
                      <span className="text-[#e8ded1] font-semibold truncate block" title={selectedCard.updated_by_name || selectedCard.created_by_name || "—"}>
                        {selectedCard.updated_by_name || selectedCard.created_by_name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7d6f62] block text-[10px]">Vytvořeno:</span>
                      <span className="text-[#a89887]">
                        {selectedCard.created_at
                          ? new Date(selectedCard.created_at).toLocaleDateString("cs-CZ", {
                              day: "numeric",
                              month: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7d6f62] block text-[10px]">Poslední úprava:</span>
                      <span className="text-[#a89887]">
                        {selectedCard.updated_at
                          ? new Date(selectedCard.updated_at).toLocaleDateString("cs-CZ", {
                              day: "numeric",
                              month: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

                  {/* Tlačítko pro rychlý přechod na minihry */}
                  <div className="pt-3 border-t border-[#2e2721]">
                    <button
                      type="button"
                      onClick={() => {
                        setRightSidebarTab("minigames");
                        if (!showGameForm && questions.length === 0) {
                          setShowGameForm(true);
                          applyBuilderMode("mood", selectedCard);
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#241c14] hover:bg-[#33261a] border border-[#d4af37]/40 text-[#ffd580] text-xs font-bold flex items-center justify-between transition cursor-pointer shadow"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#d4af37]" /> Písařské výzvy k tomuto rukopisu
                      </span>
                      <span className="bg-[#17120d] px-2 py-0.5 rounded-full text-[10px] border border-[#d4af37]/30">
                        {questions.length} výzev →
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* MINIHRY PRO TÝM (PÍSAŘSKÉ VÝZVY) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#2e2721]">
                      <button
                        type="button"
                        onClick={() => setRightSidebarTab("card")}
                        className="text-[11px] text-[#b39e87] hover:text-[#ffd580] flex items-center gap-1 cursor-pointer transition font-medium"
                      >
                        <ArrowLeft size={12} /> Zpět na úpravu karty
                      </button>
                      <span className="text-[10px] text-[#7d6f62] truncate max-w-[170px]">
                        {selectedCard.title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a96e] flex items-center gap-1.5">
                        Minihry k tomuto kolofonu ({questions.length})
                      </h3>
                      <button
                        onClick={() => {
                          if (!showGameForm) applyBuilderMode(builderMode, selectedCard);
                          setShowGameForm(!showGameForm);
                        }}
                        className="text-[11px] text-[#ffd580] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <PlusCircle size={12} /> {showGameForm ? "Zavřít formulář" : "+ Vytvořit výzvu"}
                      </button>
                    </div>

                {questions.map((q, idx) => {
                  const isTrans = q.mode === "transcription" || Boolean(q.target_transcription);
                  const qMode = q.mode || q.game_kind;
                  return (
                    <div
                      key={q.id || idx}
                      className="p-3 bg-[#1c1713] border border-[#382d22] rounded-lg text-xs space-y-2.5 relative group hover:border-[#52412d] transition shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-[#ffd580] min-w-0">
                          <span className="text-base leading-none shrink-0">
                            {qMode === "mood"
                              ? "🎭"
                              : qMode === "cipher"
                              ? "🔑"
                              : qMode === "transcription"
                              ? "✒️"
                              : "📜"}
                          </span>
                          <span className="truncate">{q.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#2e241b] text-[#c9a96e] uppercase font-semibold">
                            {qMode}
                          </span>
                          {q.difficulty && (
                            <span
                              className={`text-[9.5px] px-1.5 py-0.5 rounded font-semibold ${
                                q.difficulty === "easy"
                                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                                  : q.difficulty === "expert"
                                  ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                                  : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                              }`}
                            >
                              {q.difficulty === "easy" ? "Snadná" : q.difficulty === "expert" ? "Expert" : "Střední"}
                            </span>
                          )}
                          {q.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteGame(q.id!)}
                              className="text-[#8c524b] hover:text-[#ff6b6b] p-1 rounded hover:bg-rose-950/30 transition cursor-pointer"
                              title="Smazat minihru"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {q.intro && (
                        <p className="text-[11.5px] text-[#c2b2a1] leading-relaxed">
                          {q.intro}
                        </p>
                      )}

                      {isTrans ? (
                        <div className="text-[11px] text-[#ffd580] bg-[#14110f] p-2.5 rounded border border-[#2e2620] space-y-1">
                          <div className="text-[#a89278] text-[10px] font-semibold uppercase tracking-wider">
                            Cílový paleografický přepis:
                          </div>
                          <div className="font-serif italic text-sm leading-snug">
                            {q.target_transcription || q.quote}
                          </div>
                          {q.accepted_variants && q.accepted_variants.length > 0 && (
                            <div className="text-[10px] text-[#8c7b6d] pt-0.5">
                              Tolerované varianty: {q.accepted_variants.join(", ")}
                            </div>
                          )}
                        </div>
                      ) : (
                        Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="space-y-1 bg-[#14100c] p-2 rounded border border-[#2e241b]">
                            <div className="text-[#a89278] text-[10px] font-semibold uppercase tracking-wider mb-1">
                              Možnosti odpovědi pro hráče:
                            </div>
                            <div className="space-y-1">
                              {q.options.map((opt: any, optIdx: number) => {
                                const isCorrect = optIdx === q.correct_index;
                                const optText = Array.isArray(opt)
                                  ? opt[1] || opt[0]
                                  : typeof opt === "object"
                                  ? opt.text || opt.label
                                  : String(opt);
                                return (
                                  <div
                                    key={optIdx}
                                    className={`text-[11px] px-2 py-1 rounded flex items-center justify-between gap-2 ${
                                      isCorrect
                                        ? "bg-emerald-950/50 text-emerald-300 font-medium border border-emerald-800/50"
                                        : "bg-[#1d1813] text-[#a89887] border border-[#2c221a]"
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 min-w-0">
                                      <span className="font-mono text-[10px] text-[#7d6f62] shrink-0">
                                        {optIdx + 1}.
                                      </span>
                                      <span className="truncate">{optText}</span>
                                    </span>
                                    {isCorrect && (
                                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-900/60 px-1 py-0.2 rounded shrink-0">
                                        Správná
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )}

                      {/* Plný text nápovědy pro hráče (Hint) */}
                      {q.hint && (
                        <div className="text-[11px] bg-amber-950/30 text-amber-200 border border-amber-800/40 p-2 rounded space-y-0.5">
                          <span className="font-bold text-amber-300 flex items-center gap-1 text-[10.5px]">
                            💡 Nápověda pro hráče (Hint):
                          </span>
                          <p className="leading-relaxed whitespace-pre-wrap">{q.hint}</p>
                        </div>
                      )}

                      {/* Plný text odborného vysvětlení */}
                      {q.explanation && (
                        <div className="text-[11px] bg-[#221c17] text-[#ffd580] border border-[#473928] p-2 rounded space-y-0.5">
                          <span className="font-bold text-[#e6b955] flex items-center gap-1 text-[10.5px]">
                            📖 Paleografický vhled / odborný výklad:
                          </span>
                          <p className="text-[#d9cbba] leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {showGameForm && (
                  <div className="p-3 bg-[#171310] border border-[#d4af37]/50 rounded-lg space-y-3 text-xs shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#2e251b] pb-2">
                      <p className="font-bold text-[#ffd580] flex items-center gap-1.5">
                        <Sparkles size={13} /> Tvůrce výzvy k rukopisu
                      </p>
                      <button
                        onClick={() => setShowGameForm(false)}
                        className="text-[#8c7b6d] hover:text-[#e8ded1] text-xs"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* 4 Herní režimy */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#c9a96e] block mb-1">
                        1. Vyberte druh minihry
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyBuilderMode("mood", selectedCard)}
                          className={`p-2 rounded text-left border transition cursor-pointer flex flex-col ${
                            builderMode === "mood"
                              ? "bg-[#332213] border-[#d4af37] text-[#ffd580]"
                              : "bg-[#1f1a16] border-[#382c21] text-[#a89684] hover:border-[#6b553e]"
                          }`}
                        >
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            <Smile size={12} /> Nálada písaře
                          </span>
                          <span className="text-[9px] opacity-75 mt-0.5">Výběr ze 4 emocí · Snadná</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyBuilderMode("cipher", selectedCard)}
                          className={`p-2 rounded text-left border transition cursor-pointer flex flex-col ${
                            builderMode === "cipher"
                              ? "bg-[#332213] border-[#d4af37] text-[#ffd580]"
                              : "bg-[#1f1a16] border-[#382c21] text-[#a89684] hover:border-[#6b553e]"
                          }`}
                        >
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            <KeyRound size={12} /> Rozlušti šifru
                          </span>
                          <span className="text-[9px] opacity-75 mt-0.5">Kryptogramy & hříčky · Střední</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyBuilderMode("script", selectedCard)}
                          className={`p-2 rounded text-left border transition cursor-pointer flex flex-col ${
                            builderMode === "script"
                              ? "bg-[#332213] border-[#d4af37] text-[#ffd580]"
                              : "bg-[#1f1a16] border-[#382c21] text-[#a89684] hover:border-[#6b553e]"
                          }`}
                        >
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            <ScrollText size={12} /> Písmo a století
                          </span>
                          <span className="text-[9px] opacity-75 mt-0.5">Gotika & datace · Pokročilá</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyBuilderMode("transcription", selectedCard)}
                          className={`p-2 rounded text-left border transition cursor-pointer flex flex-col ${
                            builderMode === "transcription"
                              ? "bg-[#332213] border-[#d4af37] text-[#ffd580]"
                              : "bg-[#1f1a16] border-[#382c21] text-[#a89684] hover:border-[#6b553e]"
                          }`}
                        >
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            <PenTool size={12} /> Paleografický mistr
                          </span>
                          <span className="text-[9px] opacity-75 mt-0.5">Přepis s lupou (řádky) · Expert</span>
                        </button>
                      </div>
                    </div>

                    {/* Šifra info badge */}
                    {builderMode === "cipher" && (
                      <div
                        className={`p-2 rounded border text-[11px] flex items-start gap-2 ${
                          isCipherCard(selectedCard!)
                            ? "bg-[#2b2413] border-[#7d5f1d] text-[#e8c679]"
                            : "bg-[#251816] border-[#6b352e] text-[#e89b91]"
                        }`}
                      >
                        <KeyRound size={14} className="shrink-0 mt-0.5" />
                        <div>
                          {isCipherCard(selectedCard!) ? (
                            <span>
                              <strong>Výborně!</strong> Tento rukopis má v databázi evidovanou šifru, kryptogram nebo hříčku.
                            </span>
                          ) : (
                            <div>
                              <span>Tento rukopis nemá v Heuristu značku šifry. Chcete vybrat rukopis se šifrou?</span>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {cards.filter(isCipherCard).slice(0, 3).map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      selectCard(c);
                                      applyBuilderMode("cipher", c);
                                    }}
                                    className="bg-[#3d1d18] hover:bg-[#522720] text-[#ffd580] px-1.5 py-0.5 rounded text-[10px] border border-[#7d3b32]"
                                  >
                                    {c.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Název & Zadání */}
                    <div className="space-y-1.5">
                      <div>
                        <label className="text-[10px] text-[#9c8976]">Název výzvy</label>
                        <input
                          type="text"
                          value={builderTitle}
                          onChange={(e) => setBuilderTitle(e.target.value)}
                          className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs text-[#e8ded1]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9c8976]">Otázka pro hráče (intro)</label>
                        <input
                          type="text"
                          value={builderIntro}
                          onChange={(e) => setBuilderIntro(e.target.value)}
                          className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs text-[#e8ded1]"
                        />
                      </div>
                    </div>

                    {/* Citát a český překlad */}
                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-[#9c8976]">Citát z kolofonu</label>
                          {builderMode === "cipher" && (
                            <button
                              type="button"
                              onClick={() => {
                                const words = builderQuote.split(" ");
                                if (words.length > 2) {
                                  words[words.length - 1] = words[words.length - 1].replace(/[aeiouy]/gi, "*");
                                  setBuilderQuote(words.join(" "));
                                } else {
                                  setBuilderQuote(builderQuote.replace(/[aeiouy]/gi, "*"));
                                }
                              }}
                              className="text-[10px] text-[#ffd580] hover:underline"
                            >
                              Zamaskovat samohlásky (*)
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={builderQuote}
                          onChange={(e) => setBuilderQuote(e.target.value)}
                          className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs font-serif text-[#e8ded1]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#9c8976]">
                          Český překlad (zobrazí se v bublině pod latinským textem)
                        </label>
                        <input
                          type="text"
                          value={builderTranslation}
                          onChange={(e) => setBuilderTranslation(e.target.value)}
                          placeholder="Doplňte překlad pro hráče..."
                          className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs text-[#e8ded1]"
                        />
                      </div>
                    </div>

                    {/* REŽIM 4: PALEOGRAFICKÝ MISTR (TRANSCRIPTION) */}
                    {builderMode === "transcription" ? (
                      <div className="space-y-3 pt-2 border-t border-[#2e2620]">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-bold text-[#ffd580] flex items-center gap-1.5">
                            <PenTool size={12} /> Vyznačení řádků k přepisu
                          </label>
                          <span className="text-[10px] text-[#ffd580] bg-[#241a10] px-1.5 py-0.5 rounded border border-[#d4af37]/30 font-mono">
                            {builderStrips.length}/3 řádků
                          </span>
                        </div>

                        {/* Akční tlačítko pro přechod na velký rukopis */}
                        <button
                          type="button"
                          onClick={() => setCenterMode("strips")}
                          className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                            centerMode === "strips"
                              ? "bg-[#3d3120] text-[#ffd580] border border-[#ffd580] shadow-[0_0_12px_rgba(255,213,128,0.3)]"
                              : "bg-[#231d18] text-[#c9a96e] hover:bg-[#2d251e] border border-[#3b322a]"
                          }`}
                        >
                          <CropIcon size={13} />
                          {centerMode === "strips"
                            ? "✓ Režim vyznačení na plátně aktivní"
                            : "🎯 Vyznačit řádky myší na rukopisu vlevo"}
                        </button>

                        {/* Přehledné karty vyznačených řádků */}
                        <div className="space-y-1.5">
                          {builderStrips.map((strip, idx) => {
                            const isActive = activeStripIdx === idx && centerMode === "strips";
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActiveStripIdx(idx);
                                  setCenterMode("strips");
                                }}
                                className={`p-2 rounded border text-[11px] flex items-center justify-between transition cursor-pointer ${
                                  isActive
                                    ? "bg-[#2b2216] border-[#ffd580] text-[#ffd580] shadow"
                                    : "bg-[#14100d] border-[#2b221a] text-[#b39e87] hover:border-[#423528]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#1b150f] border border-current flex items-center justify-center font-bold text-[10px]">
                                    #{strip.line_number || idx + 1}
                                  </span>
                                  <div>
                                    <strong className="block text-[11px]">
                                      {isActive ? "Aktivní řádek (vybrán na plátně)" : `Řádek #${strip.line_number || idx + 1}`}
                                    </strong>
                                    <span className="text-[9.5px] opacity-75 font-mono">
                                      X: {Math.round(strip.x)}% · Y: {Math.round(strip.y)}% · Š: {Math.round(strip.w)}% · V: {Math.round(strip.h)}%
                                    </span>
                                  </div>
                                </div>
                                {builderStrips.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const next = builderStrips.filter((_, i) => i !== idx);
                                      setBuilderStrips(next);
                                      setActiveStripIdx(Math.max(0, idx - 1));
                                    }}
                                    className="p-1 text-[#ff7878] hover:text-[#ff9999] hover:bg-[#2e1515] rounded cursor-pointer"
                                    title="Odstranit tento řádek"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {builderStrips.length < 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              const lastY = builderStrips[builderStrips.length - 1]?.y || 60;
                              const next = [
                                ...builderStrips,
                                {
                                  x: 10,
                                  y: Math.min(88, lastY + 11),
                                  w: 80,
                                  h: 8,
                                  line_number: builderStrips.length + 1,
                                },
                              ];
                              setBuilderStrips(next);
                              setActiveStripIdx(next.length - 1);
                              setCenterMode("strips");
                            }}
                            className="text-[11px] text-[#ffd580] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <PlusCircle size={12} /> Přidat další řádek ({builderStrips.length}/3)
                          </button>
                        )}

                        <p className="text-[10px] text-[#8c7b6d] leading-relaxed">
                          💡 <b>Tip:</b> Na velkém plátně rukopisu můžete řádky posouvat tažením myši, měnit jejich velikost za rohy nebo kliknutím na prázdné místo vytvořit nový řádek.
                        </p>

                        <div>
                          <label className="text-[10px] text-[#9c8976] block">
                            Přesný vzorový přepis latiny (očekávaný text pro hráče)
                          </label>
                          <input
                            type="text"
                            value={builderTargetTranscription}
                            onChange={(e) => setBuilderTargetTranscription(e.target.value)}
                            placeholder="Např. Finito libro sit laus et gloria Christo"
                            className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs font-serif text-[#ffd580]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#9c8976] block">
                            Přípustné varianty (oddělené čárkou, např. alternativní čtení)
                          </label>
                          <input
                            type="text"
                            value={builderAcceptedVariants}
                            onChange={(e) => setBuilderAcceptedVariants(e.target.value)}
                            placeholder="Finito libro laus et gloria christo, Finito libro laus Christo"
                            className="w-full bg-[#14110f] border border-[#332921] rounded p-1.5 text-xs text-[#e8ded1]"
                          />
                        </div>
                      </div>
                    ) : (
                      /* REŽIM 1, 2, 3: VÝBĚR ZE 4 MOŽNOSTÍ */
                      <div className="space-y-2 pt-2 border-t border-[#2e2620]">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-bold text-[#c9a96e]">
                            4 Možnosti a správná volba (Radio)
                          </label>

                          {/* Šablony a rychlé generátory pro pedagogy */}
                          <div className="flex items-center gap-1.5">
                            {builderMode === "mood" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBuilderOptions([
                                      ["😌", "Úleva a vděčnost za dokončení díla"],
                                      ["🍺", "Touha po doušku dobrého vína či piva"],
                                      ["✍️", "Bolest ruky a tělesná únava"],
                                      ["😡", "Rozladění a hněv na nekvalitní pergamen"],
                                    ]);
                                    setBuilderCorrectIndex(0);
                                  }}
                                  className="text-[10px] bg-[#231b14] hover:bg-[#33271d] text-[#ffd580] px-1.5 py-0.5 rounded border border-[#4a3a29] cursor-pointer"
                                >
                                  Únava & pivo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBuilderOptions([
                                      ["👑", "Hrdost na mistrovské dokončení kodexu"],
                                      ["🙏", "Pokorná prosba za spásu písařovy duše"],
                                      ["💀", "Kletba na případného zloděje knihy"],
                                      ["⏳", "Netrpělivost a radost, že je práce u konce"],
                                    ]);
                                    setBuilderCorrectIndex(0);
                                  }}
                                  className="text-[10px] bg-[#231b14] hover:bg-[#33271d] text-[#ffd580] px-1.5 py-0.5 rounded border border-[#4a3a29] cursor-pointer"
                                >
                                  Zbožnost & hrdost
                                </button>
                              </>
                            )}

                            {builderMode === "script" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBuilderTitle("Poznej středověké písmo");
                                    setBuilderIntro("Určete, jakým typem písma je tento kolofon zapsán:");
                                    setBuilderOptions([
                                      ["📜", "Gotická textura (formalis)"],
                                      ["✒️", "Gotická bastarda"],
                                      ["🖋️", "Gotická kurzíva (notula)"],
                                      ["🏛️", "Humanistická antikva"],
                                    ]);
                                    setBuilderCorrectIndex(1);
                                  }}
                                  className="text-[10px] bg-[#231b14] hover:bg-[#33271d] text-[#ffd580] px-1.5 py-0.5 rounded border border-[#4a3a29] cursor-pointer"
                                >
                                  Gotická písma
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const year = selectedCard?.colophons?.year || 1420;
                                    const century = Math.ceil(year / 100);
                                    const isFirstHalf = year % 100 <= 50;
                                    setBuilderTitle("Datace rukopisu");
                                    setBuilderIntro(`Do kterého období spadá sepsání tohoto kodexu (rok ${year})?`);
                                    setBuilderOptions([
                                      ["⏳", `${isFirstHalf ? "1." : "2."} polovina ${century}. století`],
                                      ["⏳", `${isFirstHalf ? "2." : "1."} polovina ${century}. století`],
                                      ["⏳", `${isFirstHalf ? "2." : "1."} polovina ${century - 1}. století`],
                                      ["⏳", `${isFirstHalf ? "1." : "2."} polovina ${century + 1}. století`],
                                    ]);
                                    setBuilderCorrectIndex(0);
                                  }}
                                  className="text-[10px] bg-[#231b14] hover:bg-[#33271d] text-[#ffd580] px-1.5 py-0.5 rounded border border-[#4a3a29] cursor-pointer"
                                >
                                  Století ({selectedCard?.colophons?.year || 1420})
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {builderOptions.map((opt, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-1.5 rounded border ${
                                builderCorrectIndex === i
                                  ? "bg-[#292218] border-[#7d5f1d]"
                                  : "bg-[#14110f] border-[#292119]"
                              }`}
                            >
                              <input
                                type="radio"
                                name="correct_choice"
                                checked={builderCorrectIndex === i}
                                onChange={() => setBuilderCorrectIndex(i)}
                                className="accent-[#d4af37] cursor-pointer"
                              />
                              <input
                                type="text"
                                value={opt[0]}
                                onChange={(e) => {
                                  const next = [...builderOptions];
                                  next[i] = [e.target.value, opt[1]];
                                  setBuilderOptions(next as [string, string][]);
                                }}
                                className="w-8 text-center bg-[#1c1713] border border-[#382d22] rounded p-1 text-xs"
                                title="Ikona nebo emoji volby"
                              />
                              <input
                                type="text"
                                value={opt[1]}
                                onChange={(e) => {
                                  const next = [...builderOptions];
                                  next[i] = [opt[0], e.target.value];
                                  setBuilderOptions(next as [string, string][]);
                                }}
                                className="flex-1 bg-[#1c1713] border border-[#382d22] rounded p-1 text-xs text-[#e8ded1]"
                                placeholder={`Možnost ${i + 1}`}
                              />
                              {builderCorrectIndex === i && (
                                <span className="text-[10px] text-[#73d13d] font-bold shrink-0">Správná</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Volba obtížnosti výzvy */}
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#c9a96e] block mb-1">
                        Obtížnost výzvy
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["easy", "medium", "expert"] as const).map((diff) => {
                          const labels = { easy: "Snadná", medium: "Střední", expert: "Expert" };
                          const isSel = builderDifficulty === diff;
                          return (
                            <button
                              key={diff}
                              type="button"
                              onClick={() => setBuilderDifficulty(diff)}
                              className={`py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                                isSel
                                  ? diff === "easy"
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-500 shadow"
                                    : diff === "expert"
                                    ? "bg-rose-950 text-rose-300 border-rose-500 shadow"
                                    : "bg-amber-950 text-amber-300 border-amber-500 shadow"
                                  : "bg-[#14110f] text-[#8c7b6d] border-[#2e2620] hover:text-[#ffd580] hover:bg-[#1e1813]"
                              }`}
                            >
                              {labels[diff]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nápověda a vysvětlení */}
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="text-[10.5px] font-semibold text-[#ffd580] flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1">💡 Nápověda pro hráče (Hint)</span>
                          <span className="text-[10px] text-[#8c7b6d] font-normal">Hráč si ji může odkrýt ve hře</span>
                        </label>
                        <textarea
                          rows={2}
                          value={builderHint}
                          onChange={(e) => setBuilderHint(e.target.value)}
                          placeholder="Např. Všímejte si neobvyklých znaků, vynechaných samohlásek nebo narážek na konec práce..."
                          className="w-full bg-[#14110f] border border-[#382d22] rounded p-2 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37] resize-y leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-semibold text-[#ffd580] flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1">📖 Odborné vysvětlení / paleografický vhled</span>
                          <span className="text-[10px] text-[#8c7b6d] font-normal">Zobrazí se po vyřešení výzvy</span>
                        </label>
                        <textarea
                          rows={3}
                          value={builderExplanation}
                          onChange={(e) => setBuilderExplanation(e.target.value)}
                          placeholder="Např. Písař vyjadřuje úlevu a radost z dokončení celého kodexu. Použitá forma textu svědčí o..."
                          className="w-full bg-[#14110f] border border-[#382d22] rounded p-2 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37] resize-y leading-relaxed"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddGame}
                      className="w-full bg-[#d4af37] text-black font-bold py-2 rounded hover:bg-[#c39e2e] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Check size={14} /> Uložit minihru do Supabase
                    </button>
                  </div>
                )}
              </div>
            </>
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

      {/* MODÁLNÍ OKNO: VÝBĚR Z HEURIST SOUPISU A PŘIDÁNÍ NOVÉHO KOLOFONU */}
      <HeuristCatalogModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        existingCards={cards}
        currentUser={currentUser}
        currentProfile={currentProfile}
        onCardCreated={(newCard) => {
          setCards([newCard as CardData, ...cards]);
          selectCard(newCard as CardData);
          setLastSavedSummary("Nový kolofon zařazen z Heuristu");
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
        }}
      />
      {/* MODAL: SPRÁVA HISTORICKÝCH GLOS A MOUDER */}
      {showCuriosModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16120e] border border-[#3d3226] rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Záhlaví modalu */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2721] bg-[#1d1712]">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-[#ffd580]" />
                  <h3 className="font-serif font-bold text-base text-[#ffd580] tracking-wide">
                    Glosy, moudra a zajímavosti ze skriptoria
                  </h3>
                  <span className="text-[11px] bg-[#292017] text-[#c9a96e] px-2 py-0.5 rounded border border-[#4a3928]">
                    {curios.length} záznamů v katalogu
                  </span>
                </div>
                <p className="text-xs text-[#8c7b6d] mt-1">
                  Tyto historické poznatky a citace z kodexů vyplňují denní kartu balíčků na hlavní stránce a vzdělávají hráče.
                </p>
              </div>
              <button
                onClick={() => setShowCuriosModal(false)}
                className="text-[#8c7b6d] hover:text-white p-1 rounded hover:bg-[#2e261f] transition cursor-pointer"
                title="Zavřít okno"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tělo modalu: Split layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
              {/* LEVÝ PANEL: Seznam glos a filtry */}
              <div className="md:col-span-5 border-r border-[#2e2721] flex flex-col min-h-0 bg-[#120f0c]">
                <div className="p-3 border-b border-[#2e2721] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleNewCurioForm}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold text-xs py-1.5 px-3 rounded shadow transition cursor-pointer"
                    >
                      <PlusCircle size={14} /> Přidat novou glosu
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCuriosToDefault}
                      className="text-[11px] text-[#8c7b6d] hover:text-[#d4af37] p-1.5 rounded hover:bg-[#1e1914] transition border border-[#2e2721]"
                      title="Obnovit původní sadu 12 historických glos"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Filtrovat glosy, témata..."
                    value={curioSearch}
                    onChange={(e) => setCurioSearch(e.target.value)}
                    className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37]"
                  />

                  {/* Rychlé kategorie */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10.5px]">
                    {["Vše", "Písařské stížnosti", "Pergamen a inkoust", "Iluminace a zlato", "Tajemství kolofonů", "Středověká knihovna"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCurioCategoryFilter(cat)}
                        className={`whitespace-nowrap px-2 py-0.5 rounded transition cursor-pointer border ${
                          curioCategoryFilter === cat
                            ? "bg-[#3d3120] text-[#ffd580] border-[#d4af37]"
                            : "bg-[#18130f] text-[#8c7b6d] border-[#2e2721] hover:text-[#c9a96e]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rolovatelný seznam glos */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {curios
                    .filter((c) => {
                      const matchesSearch =
                        !curioSearch ||
                        c.title.toLowerCase().includes(curioSearch.toLowerCase()) ||
                        c.text.toLowerCase().includes(curioSearch.toLowerCase()) ||
                        c.category.toLowerCase().includes(curioSearch.toLowerCase());
                      const matchesCat =
                        curioCategoryFilter === "Vše" || c.category.toLowerCase() === curioCategoryFilter.toLowerCase();
                      return matchesSearch && matchesCat;
                    })
                    .map((c) => {
                      const isSelected = editingCurio?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCurioToEdit(c)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                            isSelected
                              ? "bg-[#282017] border-[#d4af37] shadow-sm"
                              : "bg-[#16120e] border-[#2e2721] hover:border-[#4a3928] hover:bg-[#1e1813]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#33271c] text-[#ffd580]">
                              {c.category}
                            </span>
                            <span className="text-[10px] text-[#786655] truncate max-w-[120px]">
                              {c.source || "—"}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-xs text-[#e8ded1] mb-1 line-clamp-1">
                            {c.title}
                          </h4>
                          <p className="text-[11px] text-[#9c8976] line-clamp-2 italic">
                            „{c.text}“
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* PRAVÝ PANEL: Editor a živý náhled */}
              <div className="md:col-span-7 flex flex-col min-h-0 bg-[#16120e] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2e2721]">
                  <h4 className="font-serif font-bold text-sm text-[#ffd580]">
                    {editingCurio ? `Upravit glosu: ${editingCurio.title}` : "Vytvořit novou glosu"}
                  </h4>
                  {curioSuccessMsg && (
                    <span className="text-xs text-[#73d13d] bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {curioSuccessMsg}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#c9a96e] mb-1">Kategorie glosy</label>
                    <input
                      type="text"
                      value={curioForm.category}
                      onChange={(e) => setCurioForm({ ...curioForm, category: e.target.value })}
                      placeholder="např. Písařské stížnosti, Pergamen a inkoust..."
                      className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-3 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5 text-[10px]">
                      {["Písařské stížnosti", "Tajemství kolofonů", "Pergamen a inkoust", "Iluminace a zlato", "Démoni a legendy", "Středověká knihovna", "Kletby na zloděje"].map((sugg) => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => setCurioForm({ ...curioForm, category: sugg })}
                          className="bg-[#211a14] hover:bg-[#2e241c] text-[#a89278] hover:text-[#ffd580] px-1.5 py-0.5 rounded border border-[#362b20] cursor-pointer"
                        >
                          + {sugg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#c9a96e] mb-1">Titulek / Název moudra</label>
                    <input
                      type="text"
                      value={curioForm.title}
                      onChange={(e) => setCurioForm({ ...curioForm, title: e.target.value })}
                      placeholder="např. Tři prsty píší, ale celé tělo trpí"
                      className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-3 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#c9a96e] mb-1">Text glosy či historické zajímavosti</label>
                    <textarea
                      rows={4}
                      value={curioForm.text}
                      onChange={(e) => setCurioForm({ ...curioForm, text: e.target.value })}
                      placeholder="Popište zajímavost, citaci nebo moudro o středověkých rukopisech a písařích..."
                      className="w-full bg-[#1c1612] border border-[#3b3025] rounded p-3 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#c9a96e] mb-1">Pramen, rukopis nebo datace (volitelné)</label>
                    <input
                      type="text"
                      value={curioForm.source}
                      onChange={(e) => setCurioForm({ ...curioForm, source: e.target.value })}
                      placeholder="např. Metropolitní kapitula Praha, rkp. 1387"
                      className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-3 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Živý náhled přesně tak, jak bude vypadat v denní kartě */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#8c7b6d] uppercase tracking-wider mb-2">
                      Živý náhled v kartě hry
                    </label>
                    <div
                      style={{
                        background: "rgba(255, 248, 230, 0.85)",
                        border: "1px solid #b88d57",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        boxShadow: "0 2px 6px rgba(90, 50, 15, 0.08)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <BookOpen size={13} style={{ color: "#a16207" }} />
                          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#78350f" }}>
                            Glosa ze skriptoria
                          </span>
                          <span style={{ fontSize: "10px", fontWeight: 700, background: "#fde68a", color: "#854d0e", padding: "1px 7px", borderRadius: "10px", border: "1px solid #d9770640" }}>
                            {curioForm.category || "Zajímavost"}
                          </span>
                        </div>
                        <span style={{ fontSize: "10.5px", background: "#ecd2a1", color: "#452207", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          Další ↻
                        </span>
                      </div>
                      <blockquote style={{ margin: "0 0 5px 0", fontFamily: "Cinzel, serif", fontSize: "12.5px", lineHeight: 1.45, color: "#452207", fontStyle: "italic" }}>
                        „{curioForm.text || "Zde se zobrazí text glosy zadaný výše..."}“
                      </blockquote>
                      <cite style={{ display: "block", fontSize: "11px", color: "#854d0e", fontStyle: "normal", textAlign: "right", fontWeight: 600 }}>
                        — {curioForm.source || "Pramen nebo datace"}
                      </cite>
                    </div>
                  </div>

                  {/* Tlačítka akcí */}
                  <div className="pt-3 flex items-center justify-between border-t border-[#2e2721]">
                    {editingCurio ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteCurio(editingCurio.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-3 py-1.5 rounded transition cursor-pointer border border-red-900/40"
                      >
                        <Trash2 size={13} /> Smazat glosu
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleNewCurioForm}
                        className="px-3 py-1.5 rounded text-xs text-[#9c8976] hover:bg-[#231d18] transition cursor-pointer"
                      >
                        Vyčistit formulář
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCurio}
                        disabled={!curioForm.title.trim() || !curioForm.text.trim()}
                        className="bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold text-xs px-5 py-1.5 rounded shadow transition disabled:opacity-40 cursor-pointer"
                      >
                        {editingCurio ? "Uložit změny v glose" : "Vytvořit a zařadit glosu"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SPRÁVA 16DÍLNÝCH ILUMINACÍ A DENNÍCH STREAKŮ */}
      {showMosaicsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16120e] border border-[#3d3226] rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Záhlaví modalu */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2721] bg-[#1d1712]">
              <div>
                <div className="flex items-center gap-2">
                  <Puzzle size={18} className="text-[#ffd580]" />
                  <h3 className="font-serif font-bold text-base text-[#ffd580] tracking-wide">
                    16dílné iluminace & denní streaky (Cesta písaře)
                  </h3>
                  <span className="text-[11px] bg-[#292017] text-[#c9a96e] px-2 py-0.5 rounded border border-[#4a3928]">
                    {illuminations.length} cyklů v posloupnosti
                  </span>
                </div>
                <p className="text-xs text-[#8c7b6d] mt-1">
                  Každá iluminace představuje 16denní cyklus složený ze 16 dílků (mřížka 4×4). Uživatel získává za každý den v řadě další fragment. Při přerušení streaku začíná od znovu.
                </p>
              </div>
              <button
                onClick={() => setShowMosaicsModal(false)}
                className="text-[#8c7b6d] hover:text-white p-1 rounded hover:bg-[#2e261f] transition cursor-pointer"
                title="Zavřít okno"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tělo modalu: Split layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
              {/* LEVÝ PANEL: Seznam cyklů a filtry */}
              <div className="md:col-span-5 border-r border-[#2e2721] flex flex-col min-h-0 bg-[#120f0c]">
                <div className="p-3 border-b border-[#2e2721] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleNewMosaicForm}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold text-xs py-1.5 px-3 rounded shadow transition cursor-pointer"
                    >
                      <PlusCircle size={14} /> Přidat nový cyklus
                    </button>
                    <button
                      type="button"
                      onClick={handleResetMosaicsToDefault}
                      className="text-[11px] text-[#8c7b6d] hover:text-[#d4af37] p-1.5 rounded hover:bg-[#1e1914] transition border border-[#2e2721]"
                      title="Obnovit výchozí sadu 6 cyklů Cesty písaře"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Filtrovat iluminace, rukopisy, století..."
                    value={mosaicSearch}
                    onChange={(e) => setMosaicSearch(e.target.value)}
                    className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37]"
                  />

                  {/* Rarity filtry */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10.5px]">
                    {["Vše", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setMosaicRarityFilter(r)}
                        className={`whitespace-nowrap px-2 py-0.5 rounded transition cursor-pointer border ${
                          mosaicRarityFilter === r
                            ? "bg-[#3d3120] text-[#ffd580] border-[#d4af37]"
                            : "bg-[#18130f] text-[#8c7b6d] border-[#2e2721] hover:text-[#c9a96e]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rolovatelný seznam iluminací */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {illuminations
                    .filter((m) => {
                      const matchesSearch =
                        !mosaicSearch ||
                        m.title.toLowerCase().includes(mosaicSearch.toLowerCase()) ||
                        m.origin.toLowerCase().includes(mosaicSearch.toLowerCase()) ||
                        m.century.toLowerCase().includes(mosaicSearch.toLowerCase()) ||
                        String(m.cycle).includes(mosaicSearch);
                      const matchesRarity =
                        mosaicRarityFilter === "Vše" || m.rarity === mosaicRarityFilter;
                      return matchesSearch && matchesRarity;
                    })
                    .map((m) => {
                      const isSelected = editingMosaic?.id === m.id;
                      const startDay = (m.cycle - 1) * 16 + 1;
                      const endDay = m.cycle * 16;
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMosaicToEdit(m)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition flex items-center gap-2.5 ${
                            isSelected
                              ? "bg-[#282017] border-[#d4af37] shadow-sm"
                              : "bg-[#16120e] border-[#2e2721] hover:border-[#4a3928] hover:bg-[#1e1813]"
                          }`}
                        >
                          <div className="w-10 h-10 rounded border border-[#4a3928] overflow-hidden shrink-0 bg-[#0d0a08]">
                            <img
                              src={m.source}
                              alt={m.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/illumination-rabbit.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-[#d4af37]">
                                Cyklus {m.cycle} (Dny {startDay}–{endDay})
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded rarity-pill rarity-${m.rarity.toLowerCase()}`}>
                                {m.rarity}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-xs text-[#e8ded1] truncate">
                              {m.title}
                            </h4>
                            <p className="text-[10.5px] text-[#8c7b6d] truncate">
                              {m.origin} · {m.century}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* PRAVÝ PANEL: Editor a interaktivní 16dílný řez */}
              <div className="md:col-span-7 flex flex-col min-h-0 bg-[#16120e] p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2e2721]">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#ffd580]">
                      {editingMosaic
                        ? `Cyklus ${editingMosaic.cycle}: ${editingMosaic.title}`
                        : `Vytvořit nový cyklus iluminace (${mosaicForm.cycle})`}
                    </h4>
                    <span className="text-[11px] text-[#8c7b6d]">
                      Dny {(mosaicForm.cycle - 1) * 16 + 1}–{mosaicForm.cycle * 16} denního streaku
                    </span>
                  </div>
                  {mosaicSuccessMsg && (
                    <span className="text-xs text-[#73d13d] bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {mosaicSuccessMsg}
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Pořadí cyklu</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={mosaicForm.cycle}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, cycle: Number(e.target.value) || 1 })}
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Rarita díla</label>
                      <select
                        value={mosaicForm.rarity}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, rarity: e.target.value as IlluminationRarity })}
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      >
                        {["Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Název fáze / tier</label>
                      <input
                        type="text"
                        value={mosaicForm.tierName}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, tierName: e.target.value })}
                        placeholder="např. Cyklus mistra (Dny 33–48)"
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Název iluminace</label>
                      <input
                        type="text"
                        value={mosaicForm.title}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, title: e.target.value })}
                        placeholder="např. Český královský lev"
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Datace / Století</label>
                      <input
                        type="text"
                        value={mosaicForm.century}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, century: e.target.value })}
                        placeholder="např. 14. století"
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Původní rukopis / Instituce</label>
                      <input
                        type="text"
                        value={mosaicForm.origin}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, origin: e.target.value })}
                        placeholder="např. Gelnhausenův kodex, Jihlava"
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#c9a96e]">Zdroj obrazu / URL</label>
                        <label className="cursor-pointer bg-[#2c221a] hover:bg-[#3d3024] text-[#ffd580] px-2 py-0.5 rounded border border-[#4a3928] text-[10.5px] flex items-center gap-1 transition">
                          <Upload size={11} />
                          <span>Nahrát z PC</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMosaicFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={mosaicForm.source}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, source: e.target.value })}
                        placeholder="/illuminations/nazev.jpg nebo https://..."
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                      <span className="block text-[10px] text-[#8c7b6d] mt-1">
                        Lze zadat webový odkaz, nahrát soubor z PC, nebo vložit do složky <code>public/illuminations/</code>.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Odměna za složení (XP)</label>
                      <input
                        type="number"
                        step={50}
                        value={mosaicForm.rewardXp}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, rewardXp: Number(e.target.value) || 100 })}
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Bonusový balíček</label>
                      <select
                        value={mosaicForm.rewardPack}
                        onChange={(e) => setMosaicForm({ ...mosaicForm, rewardPack: e.target.value as any })}
                        className="w-full bg-[#1c1612] border border-[#3b3025] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="standard">Standard Pack (5 karet)</option>
                        <option value="refined">Scholar Pack (vyšší šance na Rare)</option>
                        <option value="masterwork">Masterwork Pack (garance vzácností)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Popis díla pro badatele a hráče</label>
                    <textarea
                      rows={2}
                      value={mosaicForm.description}
                      onChange={(e) => setMosaicForm({ ...mosaicForm, description: e.target.value })}
                      placeholder="Krátký historický a ikonografický komentář k iluminaci..."
                      className="w-full bg-[#1c1612] border border-[#3b3025] rounded p-2 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37] leading-relaxed"
                    />
                  </div>

                  {/* INTERAKTIVNÍ 16DÍLNÝ ŘEZ A NÁHLED SLICOVÁNÍ */}
                  <div className="bg-[#1a1410] border border-[#3b2f23] rounded-lg p-3.5 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#ffd580] flex items-center gap-1.5">
                        <Puzzle size={14} /> Interaktivní náhled rozsekání na 16 dílků (4×4)
                      </span>
                      <span className="text-[11px] bg-[#2a1f14] text-[#ffd580] px-2 py-0.5 rounded border border-[#4a3928] font-bold">
                        Odhaleno: {previewPieces} z 16 dílků
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Vizuální mozaika se 16 dílky */}
                      <div
                        className="illumination-mosaic shrink-0"
                        style={{
                          width: 150,
                          height: 150,
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 8,
                          border: "2px solid #7e4c14",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          background: "#c5a36e",
                        }}
                      >
                        <img
                          src={mosaicForm.source || DEFAULT_ILLUMINATIONS[0].source}
                          alt={mosaicForm.title || "Náhled"}
                          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/illumination-rabbit.png";
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gridTemplateRows: "repeat(4, 1fr)",
                          }}
                        >
                          {Array.from({ length: 16 }).map((_, i) => (
                            <span
                              key={i}
                              style={{
                                display: "grid",
                                placeItems: "center",
                                border: "0.5px solid rgba(113, 69, 21, 0.4)",
                                fontSize: "9px",
                                fontWeight: 800,
                                fontFamily: "sans-serif",
                                transition: "all 0.25s ease",
                                color: i < previewPieces ? "transparent" : "#7c552c",
                                background:
                                  i < previewPieces
                                    ? "transparent"
                                    : "linear-gradient(145deg, #ead2a2, #caa66d)",
                                boxShadow:
                                  i < previewPieces
                                    ? "inset 0 0 0 1px rgba(255, 243, 189, 0.2)"
                                    : "inset 0 0 10px rgba(107, 66, 20, 0.25)",
                              }}
                            >
                              {i >= previewPieces ? i + 1 : ""}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Ovládání posuvníku */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between text-[11px] text-[#a89278]">
                          <span>0 dílků (skryto)</span>
                          <span className="font-bold text-[#ffd580]">{previewPieces}/16</span>
                          <span>16 dílků (dokončeno)</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={16}
                          value={previewPieces}
                          onChange={(e) => setPreviewPieces(Number(e.target.value))}
                          className="w-full accent-[#d4af37] cursor-pointer"
                        />
                        <div className="flex gap-1.5 flex-wrap pt-1">
                          {[0, 1, 4, 8, 12, 15, 16].map((step) => (
                            <button
                              key={step}
                              type="button"
                              onClick={() => setPreviewPieces(step)}
                              className={`text-[10px] px-2 py-0.5 rounded border transition ${
                                previewPieces === step
                                  ? "bg-[#d4af37] text-black font-bold border-[#d4af37]"
                                  : "bg-[#211a14] text-[#8c7b6d] border-[#362b20] hover:text-[#ffd580]"
                              }`}
                            >
                              {step === 0 ? "Den 0" : step === 16 ? "Den 16 (Dílo složeno)" : `Den ${step}`}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10.5px] text-[#8c7b6d] pt-1">
                          Posuvníkem otestujte, jak se zlacené dílky odkrývají den po dni od levého horního rohu (1) po pravý dolní (16).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tlačítka akcí */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#2e2721]">
                    {editingMosaic ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteMosaic(editingMosaic.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-3 py-1.5 rounded transition cursor-pointer border border-red-900/40"
                      >
                        <Trash2 size={13} /> Smazat cyklus
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleNewMosaicForm}
                        className="px-3 py-1.5 rounded text-xs text-[#9c8976] hover:bg-[#231d18] transition cursor-pointer"
                      >
                        Vyčistit formulář
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMosaic}
                        disabled={!mosaicForm.title.trim() || !mosaicForm.source.trim()}
                        className="bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold text-xs px-5 py-1.5 rounded shadow transition disabled:opacity-40 cursor-pointer"
                      >
                        {editingMosaic ? "Uložit změny v iluminaci" : "Vytvořit a zařadit cyklus"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODÁLNÍ OKNO: METODICKÁ PŘÍRUČKA PRO EDITORY */}
      <StudioHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* MODÁLNÍ OKNO: PŘEHLED TÝMU A REALTIME AKTIVITY (PRESENCE) */}
      {showPresenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#16120e] border border-[#3d3226] rounded-xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2e2721] bg-[#1d1712]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="font-serif font-bold text-sm text-[#ffd580] tracking-wide">
                  Aktivní editoři online ({onlineUsers.length || 1})
                </h3>
              </div>
              <button
                onClick={() => setShowPresenceModal(false)}
                className="text-[#8c7b6d] hover:text-white p-1 rounded hover:bg-[#2e261f] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-[#a89887] leading-relaxed">
                Supabase Realtime sleduje připojené editory. Pokud dva editoři otevřou tentýž kolofon, systém okamžitě zobrazí varování, aby nedošlo k nechtěnému přepsání rozpracovaných dat.
              </p>

              <div className="space-y-2 divide-y divide-[#2a221b]">
                {onlineUsers.map((user) => {
                  const isCurrent = user.userId === currentUser?.id;
                  return (
                    <div
                      key={user.userId}
                      className={`pt-2.5 first:pt-0 flex items-start justify-between gap-3 ${
                        isCurrent ? "bg-[#1f1913] p-2.5 rounded-lg border border-[#3d3020]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#2e241b] border border-[#52412d] flex items-center justify-center text-xs font-bold text-[#ffd580] shrink-0">
                          {user.userName ? user.userName.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#e8ded1] truncate">
                              {user.userName || user.userEmail.split("@")[0]}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-[#3d3120] text-[#ffd580] px-1.5 py-0.2 rounded border border-[#5c4a2a] font-bold">
                                Vy
                              </span>
                            )}
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                                user.role === "admin"
                                  ? "bg-[#3d3120] text-[#ffd580] border-[#d4af37]"
                                  : "bg-[#18232e] text-[#4a9eff] border-[#294a6e]"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8c7b6d] truncate">{user.userEmail}</p>

                          <div className="mt-1 text-[11px]">
                            {user.cardId ? (
                              <span className="text-[#ffd580] font-medium flex items-center gap-1">
                                ✍️ Edituje: <span className="underline truncate max-w-[220px]">{user.cardTitle || "Kolofon"}</span>
                              </span>
                            ) : (
                              <span className="text-[#7d6f62] italic flex items-center gap-1">
                                👀 Prohlíží katalog / lobby
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {user.cardId && !isCurrent && (
                        <button
                          onClick={() => {
                            const c = cards.find((card) => card.id === user.cardId);
                            if (c) {
                              selectCard(c);
                              setShowPresenceModal(false);
                            }
                          }}
                          className="shrink-0 text-[10px] bg-[#29221b] hover:bg-[#3d3226] text-[#c9a96e] hover:text-[#ffd580] px-2 py-1 rounded border border-[#42372d] transition cursor-pointer"
                        >
                          Přejít na kartu
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#2e2721] bg-[#1a1511] flex justify-end">
              <button
                onClick={() => setShowPresenceModal(false)}
                className="px-4 py-1.5 bg-[#292017] hover:bg-[#3a2e21] text-[#ffd580] border border-[#52412d] rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Rozumím
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
