<template>
  <KButton
    class="docs-link"
    appearance="secondary"
    size="small"
    target="_blank"
    :to="href"
  >
    <template v-slot:icon>
      <KIcon
        view-box="0 0 14 14"
        icon="externalLink"
      />
    </template>
    Documentation
  </KButton>
</template>

<script>
export default {
  name: 'Documentation',
  props: {
    href: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.docs-link {
  cursor: pointer;
  position: absolute;

  top: -48px;
  right: -4px;
}
</style>
