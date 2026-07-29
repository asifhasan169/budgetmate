import React, { useState, useRef } from 'react';
import { UserProfile, Household, Expense, Settlement } from '../../types';
import {
  User,
  Camera,
  Trash2,
  UserPlus,
  Shield,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Edit3,
  X,
  Check,
  Crown,
  Key,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { authService } from '../../services/authService';

interface ProfileViewProps {
  activeUser: UserProfile;
  users: UserProfile[];
  household: Household;
  expenses: Expense[];
  settlements?: Settlement[];
  onUpdateActiveUser: (user: UserProfile) => void;
  onRefreshUsers: () => void;
  onOpenAddRoommateModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  activeUser,
  users,
  household,
  expenses,
  settlements = [],
  onUpdateActiveUser,
  onRefreshUsers,
  onOpenAddRoommateModal
}) => {
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [removeTargetUser, setRemoveTargetUser] = useState<UserProfile | null>(null);
  const [transferTargetUser, setTransferTargetUser] = useState<UserProfile | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  // Form states for profile editing
  const [name, setName] = useState(activeUser.name || '');
  const [displayName, setDisplayName] = useState(activeUser.displayName || '');
  const [phone, setPhone] = useState(activeUser.phone || '');
  const [dob, setDob] = useState(activeUser.dob || '');
  const [gender, setGender] = useState(activeUser.gender || '');
  const [occupation, setOccupation] = useState(activeUser.occupation || '');
  const [bio, setBio] = useState(activeUser.bio || '');

  // Invite modal form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteStatusMessage, setInviteStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  // Calculate profile completion percentage
  const calculateCompletion = (u: UserProfile) => {
    const fields = [
      Boolean(u.name && u.name.trim()),
      Boolean(u.email && u.email.trim()),
      Boolean(u.displayName && u.displayName.trim()),
      Boolean(u.phone && u.phone.trim()),
      Boolean(u.occupation && u.occupation.trim()),
      Boolean(u.bio && u.bio.trim()),
      Boolean(u.avatarUrl && u.avatarUrl !== defaultAvatar)
    ];

    const filledCount = fields.filter(Boolean).length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const completionPct = calculateCompletion(activeUser);
  const isProfileIncomplete = completionPct < 100;

  // Household owner profile
  const roomOwner = users.find(u => u.role === 'owner') || users[0];
  const isOwner = activeUser.role === 'owner';

  // Handle Save Profile Form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.updateUserProfile(activeUser.id, {
      name: name.trim() || activeUser.name,
      displayName: displayName.trim(),
      phone: phone.trim(),
      dob,
      gender,
      occupation: occupation.trim(),
      bio: bio.trim()
    });
    onUpdateActiveUser(updated);
    setIsEditModalOpen(false);
  };

  // Handle Profile Picture Upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = storage.updateUserProfile(activeUser.id, {
        avatarUrl: dataUrl
      });
      onUpdateActiveUser(updated);
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Profile Picture
  const handleRemoveAvatar = () => {
    const updated = storage.updateUserProfile(activeUser.id, {
      avatarUrl: defaultAvatar
    });
    onUpdateActiveUser(updated);
  };

  // Handle Invite Roommate Submit
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatusMessage(null);

    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    try {
      const newUser = await authService.inviteRoommate(inviteName || inviteEmail.split('@')[0], inviteEmail);
      setInviteStatusMessage({ type: 'success', text: `Invitation sent! ${newUser.name} has been added to ${household.name}.` });
      setInviteEmail('');
      setInviteName('');
      onRefreshUsers();
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setInviteStatusMessage({ type: 'error', text: err.message || 'Failed to send invitation.' });
    }
  };

  // Handle Confirm Remove Roommate
  const handleConfirmRemoveRoommate = () => {
    if (!removeTargetUser) return;
    try {
      storage.removeRoommate(removeTargetUser.id);
      onRefreshUsers();
      setRemoveTargetUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to remove roommate.');
    }
  };

  // Handle Confirm Transfer Ownership
  const handleConfirmTransferOwnership = () => {
    if (!transferTargetUser) return;
    storage.transferOwnership(transferTargetUser.id);
    onRefreshUsers();
    setTransferTargetUser(null);
  };

  // Handle Leave Room
  const handleLeaveRoom = () => {
    const result = storage.leaveRoom(activeUser.id);
    if (!result.success && result.error) {
      alert(result.error);
      return;
    }
    if (result.isLastMember) {
      if (confirm('You are the last member of this room. Deleting this room will remove room metadata while preserving historical records. Proceed?')) {
        storage.deleteHousehold();
        window.location.reload();
      }
      return;
    }
    onRefreshUsers();
    setShowLeaveConfirmation(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* 1. Complete Your Profile Banner / Card */}
      {isProfileIncomplete && (
        <div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-black">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-black" />
              <h2 className="font-display font-bold text-base text-black">Complete Your Profile</h2>
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {completionPct}% Complete
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Add your phone number, occupation, bio, and custom avatar to complete your roommate identity.
            </p>
            {/* Progress Bar */}
            <div className="w-full sm:w-64 bg-neutral-100 rounded-full h-1.5 overflow-hidden mt-2 border border-neutral-200">
              <div
                className="bg-black h-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="mibu-pill-active px-4 py-2 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-center shadow-xs transition-transform active:scale-95 flex-shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Complete Profile</span>
          </button>
        </div>
      )}

      {/* 2. Main Profile Header Card */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-neutral-100 pb-6">
          
          {/* Avatar & Photo Management */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={activeUser.avatarUrl || defaultAvatar}
                alt={activeUser.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-black shadow-sm flex-shrink-0"
              />
              {/* Upload Overlay Trigger */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change profile picture"
              >
                <Camera className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display font-black text-2xl text-black tracking-tight">{activeUser.name}</h1>
                <span className="bg-neutral-100 text-black border border-neutral-200 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                  {isOwner && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  {activeUser.role}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">{activeUser.email}</p>
              {activeUser.occupation && (
                <p className="text-xs font-semibold text-neutral-800 flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                  <Briefcase className="w-3 h-3 text-neutral-400" />
                  {activeUser.occupation}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Photo Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mibu-pill px-3 py-1.5 text-xs font-semibold text-neutral-800 flex items-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5 text-neutral-500" />
              <span>Change Photo</span>
            </button>

            {activeUser.avatarUrl && activeUser.avatarUrl !== defaultAvatar && (
              <button
                onClick={handleRemoveAvatar}
                className="mibu-pill px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mibu-pill-active px-4 py-1.5 text-xs font-bold flex items-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Bio & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">About / Bio</span>
            <p className="text-neutral-700 font-medium italic">
              {activeUser.bio ? `"${activeUser.bio}"` : 'No bio added yet.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
            <div>
              <span className="text-neutral-400 text-[10px] font-bold block">Display Name</span>
              <span className="font-bold text-black">{activeUser.displayName || activeUser.name.split(' ')[0]}</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[10px] font-bold block">Phone Number</span>
              <span className="font-bold text-black">{activeUser.phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Room Information Section */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-black" />
            <h2 className="font-display font-bold text-base text-black">Room Information</h2>
          </div>
          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full border border-neutral-200 font-bold">
            Code: {household.inviteCode}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 space-y-0.5">
            <span className="text-neutral-400 font-bold text-[10px] uppercase">Room Name</span>
            <p className="font-bold text-black text-sm truncate">{household.name}</p>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 space-y-0.5">
            <span className="text-neutral-400 font-bold text-[10px] uppercase">Room Owner</span>
            <p className="font-bold text-black text-sm truncate flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              {roomOwner.name}
            </p>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 space-y-0.5">
            <span className="text-neutral-400 font-bold text-[10px] uppercase">Total Members</span>
            <p className="font-bold text-black text-sm">{users.length} roommates</p>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 space-y-0.5">
            <span className="text-neutral-400 font-bold text-[10px] uppercase">Date Joined</span>
            <p className="font-bold text-black text-sm">{activeUser.joinedDate || '12 Jan 2026'}</p>
          </div>
        </div>
      </div>

      {/* 4. Roommates & Invite Management */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="font-display font-bold text-base text-black flex items-center gap-2">
              Roommates ({users.length})
              {isOwner && (
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold uppercase">
                  Owner Admin Controls
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage shared room membership, invites & room roles
            </p>
          </div>

          {/* Add New Roommate Trigger (Every roommate can invite) */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="mibu-pill-active px-4 py-2 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-center shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Roommate</span>
          </button>
        </div>

        {/* Roommates List */}
        <div className="divide-y divide-neutral-100">
          {users.map(u => {
            const isSelf = u.id === activeUser.id;
            const isUserOwner = u.role === 'owner';

            return (
              <div key={u.id} className="py-3.5 flex items-center justify-between hover:bg-neutral-50 rounded-2xl px-3 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={u.avatarUrl || defaultAvatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-neutral-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-black truncate">{u.name}</span>
                      {isSelf && (
                        <span className="bg-neutral-100 text-black border border-neutral-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          You
                        </span>
                      )}
                      {isUserOwner && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                          Owner
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 truncate block">{u.email}</span>
                  </div>
                </div>

                {/* Owner Actions for members */}
                <div className="flex items-center space-x-2">
                  {isOwner && !isSelf && (
                    <>
                      <button
                        onClick={() => setTransferTargetUser(u)}
                        className="mibu-pill px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-black hover:border-black"
                        title="Make this member the Room Owner"
                      >
                        Transfer Ownership
                      </button>

                      <button
                        onClick={() => setRemoveTargetUser(u)}
                        className="mibu-pill px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-400"
                        title="Remove member from room"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Account Information Section */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
          <Shield className="w-5 h-5 text-black" />
          <h2 className="font-display font-bold text-base text-black">Account & Security</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
            <span className="text-neutral-400 font-bold text-[10px] uppercase block">Email Address</span>
            <span className="font-bold text-black text-xs block truncate">{activeUser.email}</span>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
            <span className="text-neutral-400 font-bold text-[10px] uppercase block">Authentication Provider</span>
            <span className="font-bold text-black text-xs block">{activeUser.authProvider || 'Supabase Auth'}</span>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
            <span className="text-neutral-400 font-bold text-[10px] uppercase block">Account Created</span>
            <span className="font-bold text-black text-xs block">{activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString() : '12 Jan 2026'}</span>
          </div>
        </div>

        {/* Leave Room Action Button */}
        <div className="pt-3 border-t border-neutral-100 flex justify-end">
          <button
            onClick={() => setShowLeaveConfirmation(true)}
            className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        </div>
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* MODAL 1: Edit Complete Profile */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-black" />
                <h3 className="font-display font-bold text-base text-black">Edit Personal Profile</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Display Name (Optional)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Nickname"
                    className="w-full bg-neutral-50 border border-neutral-200 text-black font-medium rounded-xl px-3.5 py-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={activeUser.email}
                    className="w-full bg-neutral-100 border border-neutral-200 text-neutral-500 font-medium rounded-xl px-3.5 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-neutral-50 border border-neutral-200 text-black font-medium rounded-xl px-3.5 py-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Occupation (Optional)</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="e.g. Designer, Student"
                    className="w-full bg-neutral-50 border border-neutral-200 text-black font-medium rounded-xl px-3.5 py-2 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Bio (Optional)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell your roommates a little about yourself..."
                  className="w-full bg-neutral-50 border border-neutral-200 text-black font-medium rounded-xl px-3.5 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mibu-pill px-4 py-2 font-semibold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mibu-pill-active px-5 py-2 font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Invite New Roommate */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-black" />
                <h3 className="font-display font-bold text-base text-black">Invite New Roommate</h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-4 text-xs">
              
              {inviteStatusMessage && (
                <div className={`p-3 rounded-2xl border text-xs flex items-center space-x-2 ${
                  inviteStatusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {inviteStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{inviteStatusMessage.text}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Roommate Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Email Address (Required)</label>
                <input
                  type="email"
                  required
                  placeholder="roommate@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <p className="text-[11px] text-neutral-500">
                An invitation will be generated using Supabase Auth. Invited roommates create a password and automatically join <strong className="text-black">{household.name}</strong>.
              </p>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="mibu-pill px-4 py-2 font-semibold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mibu-pill-active px-5 py-2 font-bold"
                >
                  Send Invitation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Remove Roommate Confirmation */}
      {removeTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <ShieldAlert className="w-7 h-7 flex-shrink-0" />
              <h3 className="font-display font-bold text-lg text-black">Remove Roommate</h3>
            </div>

            <p className="text-xs text-neutral-600">
              Remove <strong className="text-black font-bold">{removeTargetUser.name}</strong> ({removeTargetUser.email}) from this room?
            </p>

            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl text-[11px] text-neutral-500 space-y-1">
              <p className="font-semibold text-black">• Historical expense logs and settlement history will be strictly preserved.</p>
              <p className="font-semibold text-black">• Future fair shares will recalculate across active roommates.</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setRemoveTargetUser(null)}
                className="mibu-pill px-4 py-2 text-xs font-semibold text-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveRoommate}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full shadow-xs transition-colors"
              >
                Remove Roommate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Transfer Ownership Confirmation */}
      {transferTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-amber-600">
              <Crown className="w-7 h-7 flex-shrink-0 fill-amber-500" />
              <h3 className="font-display font-bold text-lg text-black">Transfer Room Ownership</h3>
            </div>

            <p className="text-xs text-neutral-600">
              Transfer Room Owner role to <strong className="text-black font-bold">{transferTargetUser.name}</strong>?
            </p>

            <p className="text-[11px] text-neutral-500">
              You will become a regular member, and {transferTargetUser.name} will gain admin controls to manage roommates and ownership settings.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setTransferTargetUser(null)}
                className="mibu-pill px-4 py-2 text-xs font-semibold text-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransferOwnership}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-full shadow-xs transition-colors"
              >
                Transfer Ownership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Leave Room Confirmation */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <LogOut className="w-7 h-7 flex-shrink-0" />
              <h3 className="font-display font-bold text-lg text-black">Leave Room</h3>
            </div>

            {isOwner && users.length > 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-700 font-semibold bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900">
                  You must transfer ownership before leaving this room.
                </p>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowLeaveConfirmation(false)}
                    className="mibu-pill px-4 py-2 text-xs font-semibold text-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowLeaveConfirmation(false);
                      const target = users.find(u => u.id !== activeUser.id);
                      if (target) setTransferTargetUser(target);
                    }}
                    className="mibu-pill-active px-4 py-2 text-xs font-bold"
                  >
                    Transfer Ownership
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Are you sure you want to leave <strong className="text-black font-bold">{household.name}</strong>?
                </p>
                <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => setShowLeaveConfirmation(false)}
                    className="mibu-pill px-4 py-2 text-xs font-semibold text-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full shadow-xs transition-colors"
                  >
                    Leave Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
