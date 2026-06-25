import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Menu,
  Mail,
  Lock,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  User,
  Calendar,
  Shield,
  Edit2,
  X,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import { getCurrentUser, updateCurrentUser } from "../utils/auth";
import { formatLocalDate, parseLocalDate } from "../utils/date";
import type { SavedAddress } from "../types/user";
import { userService } from "../services/user";
import { authService } from "../services/auth";
import { PlacesAutocomplete } from "../components/PlacesAutocomplete";

interface LayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
}

export function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { setSidebarOpen } = useOutletContext<LayoutContext>();
  const profile = currentUser ?? {
    id: "",
    name: "",
    email: "",
    phone: "",
    pix: "",
    bio: "",
    birthDate: "",
    gender: "",
    privateMode: false,
    savedAddresses: [],
  };

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(
    typeof window !== "undefined" && !!window.google?.maps,
  );

  useEffect(() => {
    if (window.google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.maps) {
        setGoogleMapsLoaded(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || "");
  const [pix, setPix] = useState(profile.pix || "");
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "");
  const [gender, setGender] = useState(profile.gender);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [privateMode, setPrivateMode] = useState(
    profile.privateMode || false,
  );
  const [savedMessage, setSavedMessage] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(
    profile.savedAddresses || [],
  );

  const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(
    null,
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressValue, setNewAddressValue] = useState("");

  if (!currentUser) {
    navigate("/");
    return null;
  }

  const handleSaveProfile = async () => {
  try {
    const updated = await userService.updateProfile(currentUser.id, {
      name,
      bio,
      birthDate: birthDate ?? undefined,
      gender,
    });
    updateCurrentUser(updated);
    setIsEditingProfile(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  } catch (error) {
    alert(error instanceof Error ? error.message : "Erro ao salvar perfil");
  }
};

  const handleSaveAccount = async () => {
  try {
    const updated = await userService.updateProfile(currentUser.id, {
      email,
      phone,
      pix,
    });
    updateCurrentUser(updated);
    setIsEditingAccount(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  } catch (error) {
    alert(error instanceof Error ? error.message : "Erro ao salvar conta");
  }
};

  const handleTogglePrivateMode = async () => {
  const nextPrivateMode = !privateMode;
  setPrivateMode(nextPrivateMode);
  try {
    const updated = await userService.updateProfile(currentUser.id, {
      privateMode: nextPrivateMode,
    });
    updateCurrentUser(updated);
  } catch {
    setPrivateMode(!nextPrivateMode);
    alert("Erro ao atualizar modo privado");
  }
};

  const handleAddAddress = () => {
    if (newAddressLabel.trim() && newAddressValue.trim()) {
      const newAddress: SavedAddress = {
        id: `addr-${Date.now()}`,
        label: newAddressLabel,
        address: newAddressValue,
      };
      const nextSavedAddresses = [...savedAddresses, newAddress];
      setSavedAddresses(nextSavedAddresses);
      updateCurrentUser({ savedAddresses: nextSavedAddresses });
      setNewAddressLabel("");
      setNewAddressValue("");
      setIsAddingAddress(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  const handleDeleteAddress = () => {
    if (!addressToDelete) return;

    const nextSavedAddresses = savedAddresses.filter(
      (addr) => addr.id !== addressToDelete.id,
    );
    setSavedAddresses(nextSavedAddresses);
    updateCurrentUser({ savedAddresses: nextSavedAddresses });
    setAddressToDelete(null);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const getAddressIcon = (label: string) => {
    if (label.toLowerCase() === "casa") return Home;
    if (label.toLowerCase() === "trabalho") return Briefcase;
    return MapPin;
  };

  const handleChangePassword = async () => {
  if (newPassword !== confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }
  if (newPassword.length < 6) {
    alert("A nova senha deve ter pelo menos 6 caracteres");
    return;
  }
  setChangingPassword(true);

  try {
    await authService.changePassword({
      currentPassword,
      newPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  } catch (error) {
    alert(error instanceof Error ? error.message : "Erro ao alterar senha");
  } finally {
    setChangingPassword(false);
  }

};

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 0;
    const birth = parseLocalDate(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full px-6 pt-12 pb-6 bg-primary text-primary-foreground flex-shrink-0 lg:px-8 lg:pt-8 lg:pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-background/10 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-background/10 rounded-lg transition-colors hidden lg:block"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Configurações</h1>
        </div>
      </div>

      {savedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-foreground" />
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">
                Alterações salvas!
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                Suas configurações foram atualizadas com sucesso.
              </p>

              <button
                type="button"
                onClick={() => setSavedMessage(false)}
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {addressToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold text-lg">
                  Excluir endereço
                </h2>

                <p className="text-gray-600 text-sm">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {addressToDelete.label}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {addressToDelete.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAddress}
                className="flex-1 py-3 bg-destructive text-primary-foreground font-medium rounded-lg hover:bg-destructive-hover transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {savedMessage && (
          <div className="bg-success border border-success-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-success-foreground rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-success-foreground font-semibold">Salvo com sucesso!</p>
              <p className="text-success-foreground text-sm">
                Suas alterações foram aplicadas.
              </p>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Informações do Perfil
              </h2>
            </div>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="p-2 hover:bg-info rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-5 h-5 text-info-foreground" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setName(currentUser.name);
                  setBio(currentUser.bio || "");
                  setBirthDate(currentUser.birthDate || "");
                  setGender(currentUser.gender);
                }}
                className="p-2 hover:bg-destructive-muted rounded-lg transition-colors"
                title="Cancelar"
              >
                <X className="w-5 h-5 text-destructive" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm text-foreground-muted mb-2 block font-medium">
                Nome completo
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent focus:border-primary focus: transition-all outline-none"
                />
              ) : (
                <p className="text-muted-foreground text-base px-4 py-3">
                  {name}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Gênero
              </label>
              {isEditingProfile ? (
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(
                      e.target.value as
                        | "Masculino"
                        | "Feminino"
                        | "Outro"
                        | "Prefiro nao declarar",
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro nao declarar">
                    Prefiro nao declarar
                  </option>
                </select>
              ) : (
                <p className="text-muted-foreground px-4 py-3">{gender}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Data de nascimento
              </label>
              {isEditingProfile ? (
                <>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Idade: {birthDate ? `Idade: ${calculateAge(birthDate)} anos` : ""}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground px-4 py-3">
                  {birthDate
                    ? `${formatLocalDate(birthDate)} • ${calculateAge(birthDate)} anos`
                    : "Não informado"}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Sobre mim
              </label>
              {isEditingProfile ? (
                <>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={200}
                    placeholder="Conte um pouco sobre você..."
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {bio.length}/200 caracteres
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground px-4 py-3 leading-relaxed">
                  {bio || "Nenhuma descrição adicionada."}
                </p>
              )}
            </div>
          </div>

          {isEditingProfile && (
            <button
              onClick={handleSaveProfile}
              className="w-full mt-6 py-3 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Alterações
            </button>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Dados da Conta
              </h2>
            </div>
            {!isEditingAccount ? (
              <button
                onClick={() => setIsEditingAccount(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-5 h-5 text-info-foreground" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingAccount(false);
                  setEmail(currentUser.email);
                  setPhone(currentUser.phone || "");
                  setPix(currentUser.pix || "");
                }}
                className="p-2 hover:bg-destructive-muted rounded-lg transition-colors"
                title="Cancelar"
              >
                <X className="w-5 h-5 text-destructive" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                E-mail
              </label>
              {isEditingAccount ? (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{email}</p>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Número de celular
              </label>
              {isEditingAccount ? (
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{phone || "Não informado"}</p>
                </div>
              )}
            </div>

            {/* PIX */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Chave PIX
              </label>
              {isEditingAccount ? (
                <>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={pix}
                      onChange={(e) => setPix(e.target.value)}
                      placeholder="Digite sua chave PIX"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para receber pagamentos de caronas
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{pix || "Não informado"}</p>
                </div>
              )}
            </div>
          </div>

          {isEditingAccount && (
            <button
              onClick={handleSaveAccount}
              className="w-full mt-6 py-3 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Alterações
            </button>
          )}
        </div>

        {/* Saved Addresses */}
        <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Endereços Salvos
              </h2>
            </div>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="p-2 hover:bg-info rounded-lg transition-colors"
              title="Adicionar endereço"
            >
              <Plus className="w-5 h-5 text-info-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            {savedAddresses.length === 0 && !isAddingAddress && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Nenhum endereço salvo ainda
                </p>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent-hover transition-colors text-sm"
                >
                  Adicionar primeiro endereço
                </button>
              </div>
            )}

            {savedAddresses.map((address) => {
              const Icon = getAddressIcon(address.label);
              return (
                <div
                  key={address.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {address.label}
                    </p>
                    <p className="text-sm text-muted-foreground break-words">
                      {address.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setAddressToDelete(address)}
                    className="p-2 hover:bg-destructive-muted rounded-lg transition-colors flex-shrink-0"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              );
            })}

            {isAddingAddress && (
              <div className="p-4 bg-info rounded-xl border border-info-border">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm  mb-2 block font-medium">
                      Etiqueta
                    </label>
                    <input
                      type="text"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                      placeholder="Ex: Casa, Trabalho, Academia..."
                      className="w-full px-4 py-3 rounded-xl bg-background border border-transparent focus:border-info-border transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-info-foreground mb-2 block font-medium">
                      Endereço
                    </label>
                    {googleMapsLoaded ? (
                      <PlacesAutocomplete
                        value={newAddressValue}
                        onChange={setNewAddressValue}
                        placeholder="Digite o endereço completo..."
                        className="w-full px-4 py-3 rounded-xl bg-background border border-transparent focus:border-info-border transition-all outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={newAddressValue}
                        onChange={(e) => setNewAddressValue(e.target.value)}
                        placeholder="Digite o endereço completo..."
                        className="w-full px-4 py-3 rounded-xl bg-background border border-transparent focus:border-info-border transition-all outline-none"
                      />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsAddingAddress(false);
                        setNewAddressLabel("");
                        setNewAddressValue("");
                      }}
                      className="flex-1 py-2 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-muted-hover transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddAddress}
                      disabled={
                        !newAddressLabel.trim() || !newAddressValue.trim()
                      }
                      className={`flex-1 py-2 font-medium text-muted-foreground rounded-lg transition-colors ${
                        newAddressLabel.trim() && newAddressValue.trim()
                          ? "bg-muted hover:bg-muted-hover"
                          : "bg-muted cursor-not-allowed"
                      }`}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Privacidade
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-info rounded-xl border border-info-border">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-info-foreground mb-1">
                  Modo Privado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, suas informações sensíveis (número de celular,
                  PIX e idade) ficarão ocultas para outros usuários
                </p>
              </div>
              <button
                type="button"
                onClick={handleTogglePrivateMode}
                className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-info-border focus:ring-offset-2 flex-shrink-0 ${
                  privateMode ? "bg-info-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
                    privateMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {privateMode && (
              <div className="bg-info border border-info-border rounded-xl p-4">
                <p className="text-sm text-info-foreground">
                  <strong>Informações ocultas:</strong>
                </p>
                <ul className="text-sm text-info-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Número de celular</li>
                  <li>Chave PIX</li>
                  <li>Idade</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Alterar Senha
            </h2>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Senha atual
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#1D3557] focus:bg-background transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={
              changingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className={`w-full mt-6 py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              !changingPassword && currentPassword && newPassword && confirmPassword
                ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Lock className="w-5 h-5" />
            {changingPassword ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </div>
    </div>
  );
}
