<template>
  <UiCard>
    <UiCardTitle :count="pendingTasks.length">{{ $t("tasks") }}</UiCardTitle>
    <TasksTable :finished-tasks="finishedTasks" :pending-tasks="pendingTasks" />
    <UiSpinner v-if="!isReady" class="loader" />
  </UiCard>
</template>

<script lang="ts" setup>
import TasksTable from "@/components/tasks/TasksTable.vue";
import UiCard from "@/components/ui/UiCard.vue";
import UiCardTitle from "@/components/ui/UiCardTitle.vue";
import UiSpinner from "@/components/ui/UiSpinner.vue";
import { useTaskStore } from "@/stores/task.store";
import { useTitle } from "@vueuse/core";
import { useI18n } from "vue-i18n";

const { pendingTasks, finishedTasks, isReady } = useTaskStore().subscribe();
const { t } = useI18n();

useTitle(() => t("task.page-title", { n: pendingTasks.value.length }));
</script>

<style lang="postcss" scoped>
.loader {
  color: var(--color-extra-blue-base);
  display: block;
  font-size: 4rem;
  margin: 2rem auto 0;
}
</style>
