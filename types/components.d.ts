import GlAsyncButton from '@/components/GlAsyncButton.vue'
import GlContainer from '@/components/GlContainer.vue'
import GlFilterBar from '@/components/GlFilterBar.vue'
import GlFilterItem from '@/components/GlFilterItem.vue'
import GlPagination from '@/components/GlPagination.vue'
import GlStockApplyStatusContent from '@/components/GlStockApplyStatusContent.vue'
import GlPrintSetting from "@/components/GlPrintSetting.vue";
import GlBorderCard from "@/components/GlBorderCard.vue";

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    GlContainer: typeof GlContainer,
    GlFilterBar: typeof GlFilterBar,
    GlFilterItem: typeof GlFilterItem,
    GlAsyncButton: typeof GlAsyncButton,
    GlPagination: typeof GlPagination,
    GlStockApplyStatusContent: typeof GlStockApplyStatusContent,
    GlPrintSetting: typeof GlPrintSetting,
    GlBorderCard: typeof GlBorderCard,
  }
}