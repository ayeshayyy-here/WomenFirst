// File: src/components/AutoRegisterBadge.js
// Purpose: Floating badge that (1) checks registration by CNIC, (2) auto-registers if missing, (3) shows loader or success tick.
// Usage:
//   import AutoRegisterBadge from "../components/AutoRegisterBadge";
//   <AutoRegisterBadge role="expo" /> // roles: "expo" | "ypc" | "ambassador"
// Requirements: react-native, react-native-vector-icons/FontAwesome, react-native-sync-storage

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';

// ✅ Separate base URLs for each role
const endpointsByRole = {
  expo: {
    check: 'https://wepx-wdd.punjab.gov.pk/api/check-user-expo',
    register: 'https://wepx-wdd.punjab.gov.pk/api/automatic-register-expo',
  },
  ypc: {
    check: 'https://ypc-wdd.punjab.gov.pk/api/check-user-ypc',
    register: 'https://ypc-wdd.punjab.gov.pk/api/automatic-register-ypc',
  },
  ambassador: {
    check: 'https://fa-wdd.punjab.gov.pk/api/check-user-ambassador',
    register: 'https://fa-wdd.punjab.gov.pk/api/automatic-register-ambassador',
  },
};

/** Extract trailing digits (e.g., "lahore2" -> "2"). */
// File: src/components/AutoRegisterBadge.js

/** Extract trailing digits (e.g., "lahore2" -> "2"). */
const extractDistrictId = (combinedString) => {
  if (combinedString == null) {
    console.log('[AutoRegisterBadge] ⚠️ extractDistrictId: null/undefined input');
    return '';
  }

  // If already a number, return as string
  if (typeof combinedString === 'number') {
    console.log('[AutoRegisterBadge] 🔎 extractDistrictId numeric input:', combinedString);
    return String(combinedString);
  }

  if (typeof combinedString !== 'string') {
    console.log('[AutoRegisterBadge] ⚠️ extractDistrictId: invalid input type', combinedString);
    return '';
  }

  const idMatch = combinedString.match(/\d+$/);
  console.log('[AutoRegisterBadge] 🔎 extractDistrictId input:', combinedString, '->', idMatch ? idMatch[0] : 'NO MATCH');
  return idMatch ? idMatch[0] : '';
};

// ✅ Payload mappers per role (fields may differ)
const mapPayloadByRole = {
  expo: (profile) => {
    return {
      name: profile?.name ?? profile?.Name ?? '',
      cnic: profile?.cnic ?? profile?.CNIC ?? '',
      email: profile?.email ?? profile?.Email ?? '',
      phone: profile?.contact ?? profile?.Contact ?? '',
      district_id: extractDistrictId(profile?.district ?? profile?.District ?? ''),
    };
  },
  ypc: (profile) => {
    const rawDistrict = profile?.district ?? profile?.District ?? '';
    const districtId = extractDistrictId(rawDistrict);
    console.log('[AutoRegisterBadge] 🏷 ypc rawDistrict:', rawDistrict, '-> districtId:', districtId);
    return {
      name: profile?.name ?? profile?.Name ?? '',
      cnic: profile?.cnic ?? profile?.CNIC ?? '',
      email: profile?.email ?? profile?.Email ?? '',
      phone: profile?.contact ?? profile?.Contact ?? '',
      district: districtId,
    };
  },
  ambassador: (profile) => {
    return {
      name: profile?.name ?? profile?.Name ?? '',
      cnic: profile?.cnic ?? profile?.CNIC ?? '',
      email: profile?.email ?? profile?.Email ?? '',
      phone: profile?.contact ?? profile?.Contact ?? '',
      district_id: extractDistrictId(profile?.district ?? profile?.District ?? ''),
    };
  },
};


/** Safe JSON parse. */
const parseJSON = (maybeJSON, fallback = {}) => {
  try {
    return maybeJSON ? JSON.parse(maybeJSON) : fallback;
  } catch {
    return fallback;
  }
};

// ✅ Payload mappers per role (fields may differ)
// const mapPayloadByRole = {
//   expo: (profile) => {
//     return {
//       name: profile?.name ?? profile?.Name ?? '',
//       cnic: profile?.cnic ?? profile?.CNIC ?? '',
//       email: profile?.email ?? profile?.Email ?? '',
//       phone: profile?.contact ?? profile?.Contact ?? '',
//       district_id: extractDistrictId(profile?.district ?? profile?.District ?? ''),
//     };
//   },
//   ypc: (profile) => {
//     return {
//       name: profile?.name ?? profile?.Name ?? '',
//       cnic: profile?.cnic ?? profile?.CNIC ?? '',
//       email: profile?.email ?? profile?.Email ?? '',
//       phone: profile?.contact ?? profile?.Contact ?? '',
//       district: extractDistrictId(profile?.district ?? profile?.District ?? ''),
     
//     };
//   },
//   ambassador: (profile) => {
//     return {
//       name: profile?.name ?? profile?.Name ?? '',
//       cnic: profile?.cnic ?? profile?.CNIC ?? '',
//       email: profile?.email ?? profile?.Email ?? '',
//       phone: profile?.contact ?? profile?.Contact ?? '',
//       district_id: extractDistrictId(profile?.district ?? profile?.District ?? ''),
   
//     };
//   },
// };

/**
 * AutoRegisterBadge
 * Props:
 *  - role: 'expo' | 'ypc' | 'ambassador'
 *  - size?: number (icon size)
 *  - style?: ViewStyle (position override)
 *  - onStatusChange?: (status: 'checking'|'exists'|'registering'|'registered'|'error') => void
 */
export default function AutoRegisterBadge({
  role = 'expo',
  size = 14,
  style,
  onStatusChange,
}) {
  const [status, setStatus] = useState('checking');
  const [lastMessage, setLastMessage] = useState('');
  const didRun = useRef(false);

  const endpoints = useMemo(() => {
    const key = String(role).toLowerCase();
    return endpointsByRole[key] ?? endpointsByRole.expo;
  }, [role]);

  const mapPayload = useMemo(() => {
    const key = String(role).toLowerCase();
    return mapPayloadByRole[key] ?? mapPayloadByRole.expo;
  }, [role]);

  useEffect(() => {
    if (didRun.current) return; // avoid double-run on strict mode
    didRun.current = true;

    const run = async () => {
      try {
        setStatus('checking');
        onStatusChange?.('checking');

        const stored = syncStorage.get('user_profile');
        console.log('[AutoRegisterBadge] 🔎 Loaded syncStorage.user_profile:', stored);
        const profile = parseJSON(stored, {});
        console.log('[AutoRegisterBadge] 🧩 Parsed profile:', profile);

        const payload = mapPayload(profile);
        console.log('[AutoRegisterBadge] 📦 Payload for role', role, payload);

        if (!payload?.cnic) {
          setLastMessage('Missing CNIC in syncStorage');
          throw new Error('CNIC not found in sync storage');
        }

        // 🔎 Check if exists
        const checkUrl = `${endpoints.check}/${encodeURIComponent(payload.cnic)}`;
        console.log('[AutoRegisterBadge] 🌐 GET', checkUrl);

        const checkRes = await fetch(checkUrl, { headers: { Accept: 'application/json' } });
        const checkJson = await safeJson(checkRes);
        console.log('[AutoRegisterBadge] 📥 GET response:', checkJson);

        if (checkRes.ok && checkJson?.exists) {
          setStatus('exists');
          onStatusChange?.('exists');
          setLastMessage('User already registered');
          return;
        }

        setStatus('registering');
        onStatusChange?.('registering');

        console.log('[AutoRegisterBadge] 🌐 POST', endpoints.register);
        console.log('[AutoRegisterBadge] 📨 POST body:', payload);

        const postRes = await fetch(endpoints.register, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const postJson = await safeJson(postRes);
        console.log('[AutoRegisterBadge] 📥 POST response:', postJson);

        if (!postRes.ok || !postJson?.success) {
          const errMsg = `Registration failed: ${postJson?.message || postRes.status}`;
          setLastMessage(errMsg);
          throw new Error(errMsg);
        }

        syncStorage.set(`registered_${role}`, 'true');
        console.log(`[AutoRegisterBadge] ✅ Marked registered_${role}=true`);

        setStatus('registered');
        onStatusChange?.('registered');
        setLastMessage('User registered successfully');
      } catch (e) {
        console.error('[AutoRegisterBadge] 💥 Error:', e);
        setStatus('error');
        onStatusChange?.('error');
      }
    };

    run();
  }, [endpoints, mapPayload, onStatusChange, role]);

  return (
    <View style={[styles.container, style]}>
      {status === 'checking' || status === 'registering' ? (
        <ActivityIndicator size="small" color="#99d5f1ff" />
      ) : status === 'exists' || status === 'registered' ? (
        <Icon name="check-circle" size={size} color="#451033ff" />
      ) : (
        <Icon name="exclamation-circle" size={size} color="#ef4444" />
      )}
    </View>
  );
}

async function safeJson(res) {
  try {
    const text = await res.text();
    console.log('[AutoRegisterBadge] 🧪 Raw response text:', text);
    return text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn('[AutoRegisterBadge] ⚠️ Failed to parse JSON:', e);
    return {};
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
