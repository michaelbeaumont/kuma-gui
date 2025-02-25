<template>
  <div>
    <div v-if="details.globalInstanceId || details.connectTime || details.disconnectTime">
      <h5 class="overview-tertiary-title">
        General Information:
      </h5>
      <ul>
        <li v-if="details.globalInstanceId">
          <strong>Global Instance ID:</strong>&nbsp;
          <span class="mono">{{ details.globalInstanceId }}</span>
        </li>
        <li v-if="details.controlPlaneInstanceId">
          <strong>Control Plane Instance ID:</strong>&nbsp;
          <span class="mono">{{ details.controlPlaneInstanceId }}</span>
        </li>
        <li v-if="details.connectTime">
          <strong>Last Connected:</strong>&nbsp;
          {{ details.connectTime | readableDate }}
        </li>
        <li v-if="details.disconnectTime">
          <strong>Last Disconnected:</strong>&nbsp;
          {{ details.disconnectTime | readableDate }}
        </li>
      </ul>
    </div>

    <div v-if="detailsIterator">
      <ul class="overview-stat-grid">
        <li
          v-for="(item, label) in detailsIterator"
          :key="label"
        >
          <h6 class="overview-tertiary-title">
            {{ label | humanReadable }}:
          </h6>
          <ul>
            <li
              v-for="(k, v) in item"
              :key="v"
            >
              <strong>{{ v | humanReadable }}:</strong>&nbsp;
              <span class="mono">{{ k | formatValue | formatError }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <KAlert
      v-else
      appearance="info"
      class="mt-4"
    >
      <template v-slot:alertIcon>
        <KIcon icon="portal" />
      </template>
      <template v-slot:alertMessage>
        There are no subscription statistics for <strong>{{ details.id }}</strong>
      </template>
    </KAlert>
  </div>
</template>

<script>
import { humanReadableDate, camelCaseToWords } from '@/helpers'

export default {
  name: 'SubscriptionDetails',
  filters: {
    formatValue(value) {
      return value ? parseInt(value, 10).toLocaleString('en').toString() : 0
    },
    readableDate(value) {
      return humanReadableDate(value)
    },
    humanReadable(value) {
      return camelCaseToWords(value)
    },
    formatError(value) {
      if (value === '--') {
        return 'error calculating'
      }

      return value
    },
  },
  props: {
    details: {
      type: Object,
      required: true,
    },
    isDiscoverySubscription: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    detailsIterator() {
      if (this.isDiscoverySubscription) {
        const { lastUpdateTime, total, ...restDetails } = this.details.status

        return restDetails
      }

      return this.details.status?.stat
    },
  },
}
</script>

<style lang="scss" scoped>
.overview-tertiary-title {
  font-size: var(--type-sm);
  font-weight: 500;
  text-transform: uppercase;
  color: var(--gray-3);
  margin: var(--spacing-xs) 0;
}

.overview-stat-grid {
  display: grid;
  margin: var(--spacing-md) 0 0 0;

  @media (min-width: 1140px) {
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px 20px;
  }
}
</style>
