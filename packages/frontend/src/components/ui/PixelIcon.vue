<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    class="inline-block shrink-0 align-middle"
    style="shape-rendering: crispEdges;"
  >
    <!-- TV / BigScreen Monitor -->
    <g v-if="name === 'tv'">
      <path d="M1 2h14v10H1V2zm2 2v6h10V4H3zm3 9h4v1H6v-1zm-2 2h8v1H4v-1z" />
    </g>

    <!-- Phone / Mobile Device -->
    <g v-else-if="name === 'phone'">
      <path d="M4 1h8v14H4V1zm2 2v9h4V3H6zm1 10h2v1H7v-1z" />
    </g>

    <!-- Crown / Host -->
    <g v-else-if="name === 'crown'">
      <path d="M2 4l3 3 3-4 3 4 3-4v8H2V4zm2 7h8v1H4v-1z" />
    </g>

    <!-- User / Player Avatar -->
    <g v-else-if="name === 'user'">
      <path d="M6 2h4v4H6V2zM3 8h10v2H3V8zm-1 3h12v4H2v-4z" />
    </g>

    <!-- Users / Roster -->
    <g v-else-if="name === 'users'">
      <path d="M4 2h3v3H4V2zm5 0h3v3H9V2zM1 7h6v2H1V7zm8 0h6v2H9V7zM0 10h8v4H0v-4zm8 1h8v3H8v-3z" />
    </g>

    <!-- Refresh / Reroll -->
    <g v-else-if="name === 'refresh'">
      <path d="M8 1v2H5v2H3V3h1V2h2V1h2zm3 2h2v2h-2V3zm2 3h2v4h-2V6zm-1 5h-2v2h2v-2zm-3 2v2H7v-2h2zm-4-1H3v-2h2v2zm-2-4H1V5h2v4zm1-8H2v2h2V1z" />
    </g>

    <!-- Backpack / Inventory -->
    <g v-else-if="name === 'backpack'">
      <path d="M5 1h6v2H5V1zm-2 3h10v11H3V4zm2 2v3h6V6H5zm1 1h4v1H6V7z" />
    </g>

    <!-- Target / Secret Quest -->
    <g v-else-if="name === 'target'">
      <path d="M7 1h2v3H7V1zm0 11h2v3H7v-3zM1 7h3v2H1V7zm11 0h3v2h-3V7zm-4-2h2v4H8V5zm-2 2h4v2H6V7z" />
    </g>

    <!-- Food / Rations -->
    <g v-else-if="name === 'food'">
      <path d="M4 2h8v2H4V2zm-1 3h10v9H3V5zm2 2v5h6V7H5z" />
    </g>

    <!-- Water / Hydration -->
    <g v-else-if="name === 'water'">
      <path d="M7 1h2v2H7V1zm-2 3h6v2H5V4zm-2 3h10v3H3V7zm1 4h8v3H4v-3z" />
    </g>

    <!-- Air / Oxygen -->
    <g v-else-if="name === 'air'">
      <path d="M2 4h8a2 2 0 1 0-2-2H6a4 4 0 1 1 4 4H2V4zm0 4h10a2 2 0 1 0-2-2H8a4 4 0 1 1 4 4H2V8zm0 4h7a2 2 0 1 0-2-2H5a4 4 0 1 1 4 4H2v-2z" />
    </g>

    <!-- Meds / Health -->
    <g v-else-if="name === 'meds'">
      <path d="M6 1h4v4h4v4h-4v6H6V9H2V5h4V1z" />
    </g>

    <!-- Power / Energy -->
    <g v-else-if="name === 'power'">
      <path d="M9 1L3 9h5l-2 6 7-9H8l1-5z" />
    </g>

    <!-- Morale / Heart -->
    <g v-else-if="name === 'morale'">
      <path d="M2 3h4v2H2V3zm8 0h4v2h-4V3zM1 5h14v4H1V5zm2 5h10v2H3v-2zm3 3h4v2H6v-2z" />
    </g>

    <!-- Settings / Gear -->
    <g v-else-if="name === 'settings'">
      <path d="M7 1h2v2H7V1zm-3 2h2v2H4V3zm8 0h2v2h-2V3zM1 7h2v2H1V7zm12 0h2v2h-2V7zm-9 4h2v2H4v-2zm8 0h2v2h-2v-2zm-5 2h2v2H7v-2zm-1-7h4v4H6V6z" />
    </g>

    <!-- Arrow Left -->
    <g v-else-if="name === 'arrow-left'">
      <path d="M6 3h2v2H6V3zm-2 2h2v2H4V5zm-2 2h2v2H2V7zm2 2h2v2H4V9zm2 2h2v2H6v-2zm2-4h8v2H8V7z" />
    </g>

    <!-- Arrow Right -->
    <g v-else-if="name === 'arrow-right'">
      <path d="M8 3h2v2H8V3zm2 2h2v2h-2V5zm2 2h2v2h-2V7zm-2 2h2v2h-2V9zm-2 2h2v2H8v-2zm-8-4h8v2H0V7z" />
    </g>

    <!-- Play / Start -->
    <g v-else-if="name === 'play'">
      <path d="M4 2h2v2H4V2zm2 2h2v2H6V4zm2 2h2v2H8V6zm2 2h2v2h-2V8zm-2 2h2v2H8v-2zm-2 2h2v2H6v-2zm-2 2h2v2H4v-2V2z" />
    </g>

    <!-- Lock / Locked Dossier -->
    <g v-else-if="name === 'lock'">
      <path d="M5 2h6v4h2v9H3V6h2V2zm2 2v2h2V4H7zm-1 6h4v3H6v-3z" />
    </g>

    <!-- Shield / Security -->
    <g v-else-if="name === 'shield'">
      <path d="M2 1h12v4c0 6-6 10-6 10S2 11 2 5V1zm2 2v2c0 4.5 4 7.5 4 7.5s4-3 4-7.5V3H4z" />
    </g>

    <!-- Check / Active -->
    <g v-else-if="name === 'check'">
      <path d="M13 3l2 2-8 8-4-4 2-2 2 2 6-6z" />
    </g>

    <!-- Close / Dismiss -->
    <g v-else-if="name === 'close'">
      <path d="M3 2l3 3-3 3 2 2 3-3 3 3 2-2-3-3 3-3-2-2-3 3-3-3-2 2z" />
    </g>

    <!-- Skull / Danger / Exiled -->
    <g v-else-if="name === 'skull'">
      <path d="M4 1h8v2H4V1zM2 3h12v6H2V3zm2 7h8v2H4v-2zm1 3h2v2H5v-2zm4 0h2v2H9v-2zM4 6h2v2H4V6zm6 0h2v2h-2V6z" />
    </g>

    <!-- Calendar / Day -->
    <g v-else-if="name === 'calendar'">
      <path d="M2 2h12v12H2V2zm2 2v2h2V4H4zm6 0v2h2V4h-2zm-6 4v2h2V8H4zm4 0v2h2V8H8zm4 0v2h2V8h-2zm-8 4v2h2v-2H4zm4 0v2h2v-2H8z" />
    </g>

    <!-- Flame / Fire / Threat -->
    <g v-else-if="name === 'flame'">
      <path d="M7 1h2v3H7V1zm-2 3h2v2H5V4zm6 0h2v2h-2V4zm-3 2h2v3H8V6zm-3 2h2v3H5V8zm6 0h2v3h-2V8zm-4 4h4v4H7v-4zm-4-1h2v4H3v-4zm10 0h2v4h-2v-4z" />
    </g>

    <!-- Alert / Warning -->
    <g v-else-if="name === 'alert' || name === 'warning'">
      <path d="M7 1h2v2H7V1zm-2 3h6v2H5V4zm-2 3h10v2H3V7zm-2 3h14v2H1v-2zm0 3h14v2H1v-2zM7 5h2v4H7V5zm0 5h2v2H7v-2z" />
    </g>

    <!-- Arrow Down / Reduction -->
    <g v-else-if="name === 'arrow-down'">
      <path d="M7 2h2v7h3l-4 4-4-4h3V2z" />
    </g>

    <!-- Mic / Speaker -->
    <g v-else-if="name === 'mic'">
      <path d="M6 1h4v7H6V1zm-2 5h2v2H4V6zm8 0h2v2h-2V6zm-5 4h2v3H7v-3zm-3 3h8v2H4v-2z" />
    </g>

    <!-- Briefcase / Profession -->
    <g v-else-if="name === 'briefcase'">
      <path d="M5 2h6v2H5V2zm-3 3h12v9H2V5zm2 2v5h8V7H4zm3 1h2v2H7V8z" />
    </g>

    <!-- Eye / Reveal -->
    <g v-else-if="name === 'eye'">
      <path d="M5 4h6v2H5V4zm-3 3h2v2H2V7zm12 0h2v2h-2V7zm-2 3H4v-1h8v1zm-4-2h2v2H7V8z" />
    </g>

    <!-- Help / Question -->
    <g v-else-if="name === 'help'">
      <path d="M5 2h6v2H5V2zm6 2h2v3h-2V4zm-4 3h2v2H7V7zm0 3h2v2H7v-2z" />
    </g>

    <!-- Trade / Handshake -->
    <g v-else-if="name === 'trade'">
      <path d="M2 3h7v2H2V3zm7 0l3 2-3 2V3zM7 11H0V9h7v2zm5-2l-3 2 3 2V9zm2-4H7V3h7v2z" />
    </g>

    <!-- Scale / Vote -->
    <g v-else-if="name === 'scale' || name === 'vote'">
      <path d="M7 1h2v14H7V1zm-5 4h5v2H2V5zm7 0h5v2H9V5zm-6 2l-2 5h4L3 7zm10 0l-2 5h4l-2-5zm-9 7h10v1H2v-1z" />
    </g>

    <!-- DNA / Biology -->
    <g v-else-if="name === 'dna' || name === 'bio'">
      <path d="M3 2h3v2H3V2zm7 0h3v2h-3V2zm-3 3h2v2H7V5zm-4 3h3v2H3V8zm7 0h3v2h-3V8zm-3 3h2v2H7v-2zm-4 3h3v2H3v-2zm7 0h3v2h-3v-2z" />
    </g>

    <!-- Art / Hobby / Palette -->
    <g v-else-if="name === 'art'">
      <path d="M4 2h8v2H4V2zm-2 3h12v5H2V5zm2 6h8v2H4v-2zm2 2h4v1H6v-1zm-1-6h2v2H5V7zm4 0h2v2H9V7z" />
    </g>

    <!-- Scroll / Fact -->
    <g v-else-if="name === 'scroll'">
      <path d="M3 2h8v2H3V2zm-1 3h10v8H2V5zm10 1h2v7h-2V6zm-8 1h6v1H4V7zm0 3h6v1H4v-1z" />
    </g>

    <!-- Mask / Phobia / Character -->
    <g v-else-if="name === 'mask'">
      <path d="M3 3h10v8H3V3zm2 2h2v2H5V5zm6 0h2v2h-2V5zm-4 4h4v1H7V9z" />
    </g>

    <!-- Clock / Timer -->
    <g v-else-if="name === 'clock'">
      <path d="M4 2h8v2H4V2zM2 4h12v8H2V4zm2 8h8v2H4v-2zm3-6h2v3H7V6zm2 2h2v1H9V8z" />
    </g>

    <!-- Default fallback -->
    <g v-else>
      <rect x="2" y="2" width="12" height="12" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
  }>(),
  {
    size: 16
  }
);
</script>
