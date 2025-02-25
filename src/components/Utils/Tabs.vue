<template>
  <div
    class="tab-container"
    data-testid="tab-container"
  >
    <header
      v-if="$slots.tabHeader && isReady"
      class="tab__header"
    >
      <slot name="tabHeader" />
    </header>

    <div class="tab__content-container">
      <KTabs
        v-if="isReady"
        v-model="tabState"
        :tabs="tabs"
        @changed="hash => switchTab(hash)"
      >
        <template
          v-for="tab in tabsSlots"
          v-slot:[tab]
        >
          <slot :name="tab" />
        </template>

        <template v-slot:warnings-anchor>
          <span class="flex items-center with-warnings">
            <KIcon
              color="var(--yellow-400)"
              class="mr-1"
              icon="warning"
              secondary-color="var(--black-75)"
              size="16"
            />
            <span>
              Warnings
            </span>
          </span>
        </template>
      </KTabs>

      <div v-if="loaders === true">
        <!-- loading state -->
        <KEmptyState
          v-if="isLoading"
          cta-is-hidden
        >
          <template v-slot:title>
            <div class="card-icon mb-3">
              <KIcon
                icon="spinner"
                color="rgba(0, 0, 0, 0.1)"
                size="42"
              />
            </div>
            Data Loading...
          </template>
        </KEmptyState>

        <!-- error has occurred -->
        <KEmptyState
          v-if="hasError"
          cta-is-hidden
        >
          <template v-slot:title>
            <div class="card-icon mb-3">
              <KIcon
                class="kong-icon--centered"
                color="var(--yellow-200)"
                icon="warning"
                secondary-color="var(--black-75)"
                size="42"
              />
            </div>
            An error has occurred while trying to load this data.
          </template>
        </KEmptyState>
      </div>
    </div>
  </div>
</template>

<script>
import { datadogLogs } from '@datadog/browser-logs'
import { datadogLogEvents } from '@/datadogEvents'
import KEmptyState from '@kongponents/kemptystate'

export default {
  name: 'Tabs',
  components: {
    KEmptyState,
  },
  props: {
    loaders: {
      type: Boolean,
      default: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isEmpty: {
      type: Boolean,
      default: false,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    tabs: {
      type: Array,
      required: true,
    },
    hasBorder: {
      type: Boolean,
      default: false,
    },
    initialTabOverride: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      tabState: this.initialTabOverride && `#${this.initialTabOverride}`,
    }
  },

  computed: {
    tabsSlots() {
      return this.tabs.map((tab) => tab.hash.replace('#', ''))
    },
    isReady() {
      if (this.loaders !== false) {
        return !this.isEmpty && !this.hasError && !this.isLoading
      } else {
        return true
      }
    },
  },

  methods: {
    switchTab(newTab) {
      datadogLogs.logger.info(datadogLogEvents.TABS_TAB_CHANGE, {
        data: {
          newTab,
        },
      })
      this.$emit('onTabChange', newTab)
    },
  },
}
</script>

<style>
.k-tabs ul .tab-link {
  text-decoration: none !important;
}
</style>

<style lang="scss" scoped>
.tab-container {
  --tab-container-margin: var(--spacing-lg) 0 0 0;
  --tab-header-margin: 0 -10px var(--spacing-md) -10px;
  --tab-header-padding: 0 var(--spacing-md);
  --tab-header-title-font-size: var(--type-md);
  --tab-header-title-font-weight: 500;
  --tab-nav-border-bottom: 1px solid var(--gray-4);
  --tab-link-radius: 3px 3px 0 0;
  --tab-link-padding: var(--spacing-sm) var(--spacing-lg);
  --tab-link-gap: var(--spacing-sm);
  --tab-link-active-text-color: var(--blue-4);
  --tab-active-background-color: var(--gray-7);
  --tab-link-background-color: #fff;
  --tab-link-border: 1px solid var(--gray-4);
  --tab-active-border-color: var(--gray-4);
  --tab-panel-padding: var(--spacing-sm);
  --tab-panel-border: 1px solid var(--gray-4);
  --tab-panel-radius: 0 0 3px 3px;

  margin: var(--tab-container-margin);
}

.tab__header {
  display: flex;
  align-items: center;
  margin: var(--tab-header-margin);
  padding: var(--tab-header-padding);

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: var(--tab-header-title-font-size);
    font-weight: var(--tab-header-title-font-weight);
  }

  > div,
  > h3 {
    padding: 0 10px;
  }
}

.tab__content-container {
  position: relative;
  z-index: 1;
}

.with-warnings {
  color: var(--yellow-400);
}
</style>
