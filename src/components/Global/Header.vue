<template>
  <header class="main-header px-4 py-1 flex justify-between items-center">
    <div class="py-1 md:py-0 flex justify-between items-center">
      <router-link
        :to="{
          name: 'global-overview',
          params: {
            mesh: selectedMesh
          }
        }"
        class="logo"
      >
        <img
          src="@/assets/images/product-logo.png?external"
          :alt="`${tagline} Logo`"
        >
      </router-link>
      <div class="my-0 mx-6 upgrade-check-wrapper">
        <UpgradeCheck />
      </div>
    </div>
    <div class="flex justify-between items-center">
      <div
        v-if="showStatus"
        class="py-1 md:py-0 md:px-4"
      >
        <div class="app-status app-status--mobile">
          <KPop
            width="300"
            placement="bottomEnd"
          >
            <KButton
              class="kpop-control"
              appearance="primary"
              size="small"
            >
              Info
            </KButton>
            <template v-slot:content>
              <div>
                <p>
                  {{ statusContent }} on <strong>{{ env }}</strong>
                </p>
                <p>
                  <KBadge appearance="success">
                    <span v-if="multicluster">
                      Multi-Zone
                    </span>
                    <span v-else>
                      Standalone
                    </span>
                  </KBadge>
                </p>
              </div>
            </template>
          </KPop>
        </div>
        <div class="app-status app-status--desktop">
          <div class="flex items-center justify-center text-sm">
            <strong> {{ statusContent }} on {{ env }}</strong>
            <KBadge
              appearance="success"
              class="status-badge"
            >
              <span v-if="multicluster">
                Multi-Zone
              </span>
              <span v-else>
                Standalone
              </span>
            </KBadge>
            <NotificationIcon />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getKumaCpServerUrl } from '@/configUrl'
import UpgradeCheck from '@/components/Utils/UpgradeCheck'
import NotificationIcon from './NotificationIcon'

export default {
  components: {
    UpgradeCheck,
    NotificationIcon,
  },
  data() {
    return {
      shortVersion: '',
      apiUrl: getKumaCpServerUrl(),
      initialBodyPaddingTop: '',
    }
  },
  computed: {
    ...mapState({
      selectedMesh: (state) => state.selectedMesh,
    }),
    ...mapGetters({
      // this checks the status of the API itself
      status: 'config/getStatus',
      environment: 'config/getEnvironment',
      // the status of multicluster
      multicluster: 'config/getMulticlusterStatus',
      tagline: 'config/getTagline',
      version: 'config/getVersion',
    }),
    env() {
      if (this.environment) {
        return `${this.environment.charAt(0).toUpperCase()}${this.environment.slice(1)}`
      }

      return ''
    },
    showStatus() {
      return !this.$route.meta.hideStatus && this.status === 'OK'
    },
    showEnterprise() {
      return process.env.VUE_APP_SHOW_ENTERPRISE_BUTTON === 'true'
    },
    statusContent() {
      if (this.guiStatus) {
        return `${this.tagline} v${this.version}`
      }

      return `Unable to determine ${this.tagline}'s status`
    },
    guiStatus() {
      return Boolean(this.env && this.apiUrl)
    },
  },
  mounted() {
    this.initialBodyPaddingTop = document.body.style.paddingTop

    document.body.style.paddingTop = 'var(--topbar-height)'
  },
  destroyed() {
    document.body.style.paddingTop = this.initialBodyPaddingTop
  },
}
</script>

<style lang="scss" scoped>
.main-header {
  position: fixed;
  z-index: 1030;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--topbar-height);
  border-bottom: 1px solid var(--black-10);
  background-color: #fff;
}

.main-header--simple {
  border-bottom: 0;
  background: none;
}

.logo {
  img {
    display: block;
    width: auto;
    height: auto;
    max-height: var(--logo-max-height);
  }
}

.upgrade-check-wrapper {
  margin-left: auto;
}

.status-badge {
  --KBadgeWidth: auto;
  --KBadgePaddingX: var(--spacing-sm);
}

.app-status {
  display: flex;
  align-items: center;

  .kpop-control {
    max-height: 27px;

    &:after {
      display: none;
    }
  }

  &--desktop {
    letter-spacing: 0.025em;
    color: var(--gray-3);
  }

  @media screen and (min-width: 1024px) {
    &--desktop {
      display: block;
    }

    &--mobile {
      display: none;
    }
  }

  @media screen and (max-width: 1023px) {
    &--desktop {
      display: none;
    }

    &--mobile {
      display: block;
    }
  }
}

@media screen and (min-width: 990px) {
  .status-badge {
    margin-left: var(--spacing-sm);
  }
}

@media screen and (max-width: 989px) {
  .status-badge {
    margin-top: var(--spacing-sm);
  }
}

@media screen and (max-width: 599px) {
  .upgrade-check-wrapper {
    display: none;
  }
}
</style>
