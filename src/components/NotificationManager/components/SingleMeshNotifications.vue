<template>
  <Accordion multiple-open>
    <AccordionItem
      v-for="item in singleMeshNotificationItems"
      :key="item.name"
    >
      <template v-slot:accordion-header>
        <div class="flex items-center">
          <KIcon
            v-if="item.isCompleted"
            color="var(--green-400)"
            icon="check"
            size="20"
            class="mr-4"
          />
          <KIcon
            v-else
            color="var(--yellow-300)"
            secondary-color="var(--black-75)"
            icon="warning"
            size="20"
            class="mr-4"
          />
          <strong>{{ item.name }}</strong>
        </div>
      </template>

      <template v-slot:accordion-content>
        <component
          :is="item.component"
          v-if="item.component"
        />
        <template v-else>
          <KCard>
            <template v-slot:body>
              {{ item.content }}
            </template>
          </KCard>
        </template>
      </template>
    </AccordionItem>
  </Accordion>
</template>

<script>
import { mapGetters } from 'vuex'
import Accordion from '@/components/Accordion/Accordion'
import AccordionItem from '@/components/Accordion/AccordionItem'
import OnboardingNotification from './OnboardingNotification.vue'
import LoggingNotification from './LoggingNotification.vue'
import MetricsNotification from './MetricsNotification.vue'
import MtlsNotification from './MtlsNotification.vue'
import TracingNotification from './TracingNotification.vue'

export default {
  name: 'SingleMeshNotifications',
  components: {
    Accordion,
    AccordionItem,
    OnboardingNotification,
    LoggingNotification,
    MetricsNotification,
    MtlsNotification,
    TracingNotification,
  },
  computed: {
    ...mapGetters({
      singleMeshNotificationItems: 'notifications/singleMeshNotificationItems',
    }),
  },
}
</script>
