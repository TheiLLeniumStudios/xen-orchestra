<template>
  <UiCard class="linear-chart" :color="hasError ? 'error' : undefined">
    <UiCardChartTitle>{{ $t("pool-ram-usage") }} </UiCardChartTitle>
    <UiCardChartTitle subtitle> {{ $t("last-week") }}</UiCardChartTitle>
    <NoDataError v-if="hasError" />
    <template v-else>
      <UiSpinner v-if="isLoading" class="spinner" />
      <LinearChart
        v-else
        :data="data"
        :max-value="customMaxValue"
        :value-formatter="customValueFormatter"
      >
        <template #summary>
          <SizeStatsSummary
            :size="currentData.size"
            :usage="currentData.usage"
          />
        </template>
      </LinearChart>
    </template>
  </UiCard>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import type { FetchedStats } from "@/composables/fetch-stats.composable";
import { formatSize, getHostMemory, isHostRunning } from "@/libs/utils";
import type { HostStats } from "@/libs/xapi-stats";
import { isEmpty, sumBy } from "lodash-es";
import LinearChart from "@/components/charts/LinearChart.vue";
import type { LinearChartData } from "@/types/chart";
import NoDataError from "@/components/NoDataError.vue";
import { RRD_STEP_FROM_STRING } from "@/libs/xapi-stats";
import SizeStatsSummary from "@/components/ui/SizeStatsSummary.vue";
import { storeToRefs } from "pinia";
import UiCard from "@/components/ui/UiCard.vue";
import UiCardChartTitle from "@/components/ui/UiChartCardTitle.vue";
import { useHostStore } from "@/stores/host.store";
import { useI18n } from "vue-i18n";
import UiSpinner from "@/components/ui/UiSpinner.vue";
import type { XenApiHost } from "@/libs/xen-api";

const hostStore = useHostStore();
const { allRecords: hosts, hasError } = storeToRefs(hostStore);
const { t } = useI18n();

const hostLastWeekStats =
  inject<FetchedStats<XenApiHost, HostStats>>("hostLastWeekStats");

const runningHosts = computed(() => hosts.value.filter(isHostRunning));
const customMaxValue = computed(() =>
  sumBy(runningHosts.value, (host) => getHostMemory(host)?.size ?? 0)
);

const currentData = computed(() => {
  let size = 0,
    usage = 0;
  runningHosts.value.forEach((host) => {
    const hostMemory = getHostMemory(host);
    size += hostMemory?.size ?? 0;
    usage += hostMemory?.usage ?? 0;
  });
  return { size, usage };
});

const data = computed<LinearChartData>(() => {
  const timestampStart = hostLastWeekStats?.timestampStart?.value;
  const stats = hostLastWeekStats?.stats?.value;

  if (timestampStart === undefined || stats == null) {
    return [];
  }

  const result = new Map<number, { timestamp: number; value: number }>();

  stats.forEach(({ stats }) => {
    if (stats?.memory === undefined) {
      return;
    }

    const memoryFree = stats.memoryFree;
    const memoryUsage = stats.memory.map(
      (memory, index) => memory - memoryFree[index]
    );

    memoryUsage.forEach((value, hourIndex) => {
      const timestamp =
        (timestampStart + hourIndex * RRD_STEP_FROM_STRING.hours) * 1000;

      result.set(timestamp, {
        timestamp,
        value: (result.get(timestamp)?.value ?? 0) + memoryUsage[hourIndex],
      });
    });
  });

  return [
    {
      label: t("stacked-ram-usage"),
      data: Array.from(result.values()),
    },
  ];
});

const isStatFetched = computed(() => {
  const stats = hostLastWeekStats?.stats?.value;

  return (
    !isEmpty(stats) &&
    stats.every((host) => {
      const hostStats = host.stats;
      return (
        hostStats != null &&
        hostStats.memory.length === data.value[0].data.length
      );
    })
  );
});

const isLoading = computed(
  () => (hostStore.isLoading && !hostStore.hasError) || !isStatFetched.value
);

const customValueFormatter = (value: number) => String(formatSize(value));
</script>

<style lang="postcss" scoped>
.spinner {
  color: var(--color-extra-blue-base);
  display: flex;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
