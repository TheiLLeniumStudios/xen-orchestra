<template>
  <UiTable class="tasks-table">
    <thead>
      <tr>
        <th>{{ $t("name") }}</th>
        <th>{{ $t("object") }}</th>
        <th>{{ $t("task.progress") }}</th>
        <th>{{ $t("task.started") }}</th>
        <th>{{ $t("task.estimated-end") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!hasTasks">
        <td class="no-tasks" colspan="5">{{ $t("no-tasks") }}</td>
      </tr>
      <TaskRow
        v-for="task in pendingTasks"
        :key="task.uuid"
        :task="task"
        is-pending
      />
      <TaskRow
        v-for="task in finishedTasks ?? []"
        :key="task.uuid"
        :task="task"
      />
    </tbody>
  </UiTable>
</template>

<script lang="ts" setup>
import TaskRow from "@/components/tasks/TaskRow.vue";
import UiTable from "@/components/ui/UiTable.vue";
import type { XenApiTask } from "@/libs/xen-api";
import { computed } from "vue";

const props = defineProps<{
  pendingTasks: XenApiTask[];
  finishedTasks?: XenApiTask[];
}>();

const hasTasks = computed(
  () => props.pendingTasks.length > 0 || (props.finishedTasks?.length ?? 0) > 0
);
</script>

<style lang="postcss" scoped>
.tasks-table {
  width: 100%;

  .no-tasks {
    text-align: center;
    color: var(--color-blue-scale-300);
    font-style: italic;
  }
}
</style>
