<template>
  <div :class="classes">
    <KButton
      v-if="previousStep"
      appearance="primary"
      class="navigation-button navigation-button--back"
      :to="{
        name: previousStep,
      }"
      @click.native="changeStep(previousStep)"
    >
      Back
    </KButton>
    <div>
      <KButton
        v-if="showSkip"
        class="skip-button"
        appearance="btn-link"
        size="small"
        @click.native="skipOnboarding"
      >
        Skip Setup
      </KButton>
      <span :class="['inline-block', {'cursor-not-allowed': !shouldAllowNext} ]">
        <KButton
          :disabled="!shouldAllowNext"
          class="navigation-button navigation-button--next"
          appearance="primary"
          :to="{
            name: nextStep,
          }"
          @click.native="lastStep ? skipOnboarding() : changeStep(nextStep)"
        >
          {{ nextStepTitle }}
        </KButton>
      </span>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'OnboardingNavigation',
  props: {
    shouldAllowNext: {
      type: Boolean,
      default: true,
    },
    showSkip: {
      type: Boolean,
      default: true,
    },
    nextStep: {
      type: String,
      required: true,
    },
    previousStep: {
      type: String,
      default: '',
    },
    nextStepTitle: {
      type: String,
      default: 'Next',
    },
    lastStep: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      return [
        'mt-4 flex items-center flex-col sm:flex-row',
        {
          'justify-center': this.lastStep,
          'justify-between': this.previousStep && !this.lastStep,
          'justify-end': !this.previousStep && !this.lastStep,
        },
      ]
    },
  },
  methods: {
    ...mapActions('onboarding', ['completeOnboarding', 'changeStep']),

    skipOnboarding() {
      this.completeOnboarding()
      this.$router.push({
        name: 'global-overview',
        params: {
          mesh: 'all',
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.navigation-button {
  @apply text-lg font-bold;

  --KButtonPaddingY: 12px;
  --KButtonPaddingX: 48px;
  --KButtonRadius: 25px;

  &--back {
    color: #646464 !important;
    --KButtonPrimaryBase: var(--OnboardingBackButton);
    --KButtonPrimaryHover: var(--OnboardingBackButtonHover);
    --KButtonPrimaryActive: var(--OnboardingBackButtonHover);
  }

  &--next {
    --KButtonPrimaryBase: var(--OnboardingNextButton);
    --KButtonPrimaryHover: var(--OnboardingNextButtonHover);
    --KButtonPrimaryActive: var(--OnboardingNextButtonHover);
  }

  &[disabled] {
    cursor: not-allowed;
  }
}

.skip-button {
  @apply font-medium mr-8;

  --KButtonBtnLink: var(--OnboardingSkipSetupButton);
}
</style>
