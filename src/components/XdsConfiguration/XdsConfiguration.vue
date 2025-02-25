<template>
  <StatusInfo
    :has-error="hasError"
    :is-loading="isLoading"
  >
    <KCard border-variant="noBorder">
      <template v-slot:body>
        <div v-if="multicluster">
          <span>XDS Configuration is only available in standalone mode at this moment. </span>
          <a href="https://github.com/kumahq/kuma/issues/3789">This will be improved in the future release of Kuma.</a>
        </div>
        <Prism
          v-else
          id="xds"
          language="json"
          :code="xds"
        />
      </template>
      <template v-if="multicluster === false" v-slot:actions>
        <KClipboardProvider
          v-if="xds"
          v-slot="{ copyToClipboard }"
        >
          <KPop placement="bottom">
            <KButton
              appearance="primary"
              @click="() => { copyToClipboard(xds) }"
            >
              Copy config to clipboard
            </KButton>
            <template v-slot:content>
              <div>
                <p>Config copied to clipboard!</p>
              </div>
            </template>
          </KPop>
        </KClipboardProvider>
      </template>
    </kcard>
  </StatusInfo>
</template>

<script>
import Kuma from '@/services/kuma'
import StatusInfo from '@/components/Utils/StatusInfo'
import Prism from 'vue-prismjs'
import { mapGetters } from 'vuex'

export default {
  name: 'XdsConfiguration',
  components: {
    StatusInfo,
    Prism,
  },
  props: {
    mesh: {
      type: String,
      default: '',
    },
    dppName: {
      type: String,
      default: '',
    },
    zoneIngressName: {
      type: String,
      default: '',
    },
    zoneEgressName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isLoading: true,
      hasError: false,
    }
  },

  computed: {
    ...mapGetters({
      multicluster: 'config/getMulticlusterStatus',
    }),
  },

  watch: {
    dppName() {
      this.fetchXds()
    },
    zoneIngressName() {
      this.fetchXds()
    },
    zoneEgressName() {
      this.fetchXds()
    },
  },
  mounted() {
    this.fetchXds()
  },

  methods: {
    async fetchXds() {
      this.hasError = false
      this.isLoading = true

      try {
        let xds = {}

        if (!this.multicluster) {
          if (this.mesh !== '' && this.dppName !== '') {
            xds = await Kuma.getDataplaneXds({
              mesh: this.mesh,
              dppName: this.dppName,
            })
          } else if (this.zoneIngressName !== '') {
            xds = await Kuma.getZoneIngressXds({
              zoneIngressName: this.zoneIngressName,
            })
          } else if (this.zoneEgressName !== '') {
            xds = await Kuma.getZoneEgressXds({
              zoneEgressName: this.zoneEgressName,
            })
          }
        }

        this.xds = JSON.stringify(xds, null, 2)
      } catch (e) {
        console.error(e)
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
#xds {
  max-height: 1000px;
}
</style>
