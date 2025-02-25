<template>
  <div class="fault-injections relative">
    <DocumentationLink :href="docsURL" />
    <FrameSkeleton>
      <DataOverview
        :page-size="pageSize"
        :has-error="hasError"
        :is-loading="isLoading"
        :empty-state="empty_state"
        :table-data="tableData"
        :table-data-is-empty="tableDataIsEmpty"
        :next="next"
        @tableAction="tableAction"
        @loadData="loadData($event)"
      >
        >
        <template v-slot:additionalControls>
          <KButton
            v-if="$route.query.ns"
            class="back-button"
            appearance="primary"
            size="small"
            :to="{
              name: 'fault-injections'
            }"
          >
            <span class="custom-control-icon">
              &larr;
            </span>
            View All
          </KButton>
        </template>
      </DataOverview>
      <Tabs
        v-if="isEmpty === false"
        :has-error="hasError"
        :is-loading="isLoading"
        :tabs="tabs"
        initial-tab-override="overview"
      >
        <template v-slot:tabHeader>
          <div>
            <h3>
              Fault Injection: {{ entity.name }}
            </h3>
          </div>
          <div>
            <EntityURLControl
              :name="entity.name"
              :mesh="entity.mesh"
            />
          </div>
        </template>
        <template v-slot:overview>
          <LabelList
            :has-error="entityHasError"
            :is-loading="entityIsLoading"
            :is-empty="entityIsEmpty"
          >
            <div>
              <ul>
                <li
                  v-for="(val, key) in entity"
                  :key="key"
                >
                  <h4>{{ key }}</h4>
                  <p>
                    {{ val }}
                  </p>
                </li>
              </ul>
            </div>
          </LabelList>
        </template>
        <template v-slot:affected-dpps>
          <PolicyConnections
            :mesh="rawEntity.mesh"
            :policy-name="rawEntity.name"
            policy-type="fault-injections"
          />
        </template>
        <template v-slot:yaml>
          <YamlView
            lang="yaml"
            :has-error="entityHasError"
            :is-loading="entityIsLoading"
            :is-empty="entityIsEmpty"
            :content="rawEntity"
          />
        </template>
      </Tabs>
    </FrameSkeleton>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSome, stripTimes } from '@/helpers'
import { getTableData } from '@/utils/tableDataUtils'
import Kuma from '@/services/kuma'
import EntityURLControl from '@/components/Utils/EntityURLControl'
import FrameSkeleton from '@/components/Skeletons/FrameSkeleton'
import DataOverview from '@/components/Skeletons/DataOverview'
import Tabs from '@/components/Utils/Tabs'
import PolicyConnections from '@/components/PolicyConnections/PolicyConnections'
import YamlView from '@/components/Skeletons/YamlView'
import LabelList from '@/components/Utils/LabelList'
import DocumentationLink from '@/components/DocumentationLink/DocumentationLink.vue'
import { PAGE_SIZE_DEFAULT } from '@/consts'

export default {
  name: 'FaultInjections',
  metaInfo: {
    title: 'Fault Injections',
  },
  components: {
    EntityURLControl,
    FrameSkeleton,
    DataOverview,
    Tabs,
    YamlView,
    LabelList,
    PolicyConnections,
    DocumentationLink,
  },
  data() {
    return {
      isLoading: true,
      isEmpty: false,
      hasError: false,
      entityIsLoading: true,
      entityIsEmpty: false,
      entityHasError: false,
      tableDataIsEmpty: false,
      empty_state: {
        title: 'No Data',
        message: 'There are no Fault Injections present.',
      },
      tableData: {
        headers: [
          { key: 'actions', hideLabel: true },
          { label: 'Name', key: 'name' },
          { label: 'Mesh', key: 'mesh' },
          { label: 'Type', key: 'type' },
        ],
        data: [],
      },
      tabs: [
        {
          hash: '#overview',
          title: 'Overview',
        },
        { hash: '#affected-dpps', title: 'Affected DPPs' },
        {
          hash: '#yaml',
          title: 'YAML',
        },
      ],
      entity: {},
      rawEntity: {},
      pageSize: PAGE_SIZE_DEFAULT,
      next: null,
    }
  },
  computed: {
    ...mapGetters({
      version: 'config/getVersion',
    }),
    docsURL() {
      return `https://kuma.io/docs/${this.version}/policies/fault-injection/`
    },
  },
  watch: {
    $route(to, from) {
      this.init()
    },
  },
  beforeMount() {
    this.init()
  },
  methods: {
    init() {
      this.loadData()
    },
    tableAction(ev) {
      const data = ev

      // load the data into the tabs
      this.getEntity(data)
    },

    async loadData(offset = '0') {
      this.isLoading = true
      const query = this.$route.query.ns || null
      const mesh = this.$route.params.mesh || null

      try {
        const { data, next } = await getTableData({
          getSingleEntity: Kuma.getFaultInjection.bind(Kuma),
          getAllEntities: Kuma.getAllFaultInjections.bind(Kuma),
          getAllEntitiesFromMesh: Kuma.getAllFaultInjectionsFromMesh.bind(Kuma),
          mesh,
          query,
          size: this.pageSize,
          offset,
        })

        // set pagination
        this.next = next

        // set table data
        if (data.length) {
          this.tableData.data = data
          this.tableDataIsEmpty = false
          this.isEmpty = false
          const selected = ['type', 'name', 'mesh']
          const selectedEntity = data[0]

          this.entity = getSome(selectedEntity, selected)
          this.rawEntity = stripTimes(selectedEntity)
        } else {
          this.tableData.data = []
          this.tableDataIsEmpty = true
          this.isEmpty = true
          this.entityIsEmpty = true
        }
      } catch (error) {
        this.hasError = true
        this.isEmpty = true
        console.error(error)
      } finally {
        this.isLoading = false
        this.entityIsLoading = false
      }
    },
    getEntity(entity) {
      this.entityIsLoading = true
      this.entityIsEmpty = false
      this.entityHasError = false

      const mesh = this.$route.params.mesh

      if (entity) {
        const entityMesh = mesh === 'all' ? entity.mesh : mesh

        return Kuma.getFaultInjection({ mesh: entityMesh, name: entity.name })
          .then((response) => {
            if (response) {
              const selected = ['type', 'name', 'mesh']

              this.entity = getSome(response, selected)
              // this.rawEntity = response
              this.rawEntity = stripTimes(response)
            } else {
              this.entity = {}
              this.entityIsEmpty = true
            }
          })
          .catch((error) => {
            this.entityHasError = true
            console.error(error)
          })
          .finally(() => {
            setTimeout(() => {
              this.entityIsLoading = false
            }, process.env.VUE_APP_DATA_TIMEOUT)
          })
      } else {
        setTimeout(() => {
          this.entityIsEmpty = true
          this.entityIsLoading = false
        }, process.env.VUE_APP_DATA_TIMEOUT)
      }
    },
  },
}
</script>
