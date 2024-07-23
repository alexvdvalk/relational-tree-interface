<template>
  <div>
    <!-- <input v-model="a" class="border" />
    {{ a }} -->
    <!-- <VCheckbox v-for="c in choices" v-model="c.selected" :value="c.value">
      {{ c.text }}
    </VCheckbox> -->
    <!-- <VButton @click="addE"> My Button </VButton> -->
    <!-- <GetSelectedIDs v-slot="slotProps">{{
      JSON.stringify(slotProps)
    }}</GetSelectedIDs> -->
    <interface-select-multiple-checkbox-tree
      v-if="loaded"
      :choices="choices"
      valueCombining="all"
      @input="newInput"
      :value="value"
    />
    <!-- <VCheckboxTree v-model="value" :choices="choices" :value="[]" /> -->
  </div>
</template>

<script setup lang="ts">
// import GetSelectedIDs from "./GetSelectedIDs.vue";
import { ref, watch, toRef, computed } from "vue";
import { useItems, useStores } from "@directus/extensions-sdk";

import { onMounted } from "vue";

let value = ref<string[]>([]);
let loaded = ref(false);

const props = defineProps(["value", "field", "primaryKey", "collection"]);
const refProps = toRef(props);
const junctionTable = ref("cs_product_cs_components");

let choices = ref<Choice[]>([]);

watch(props, () => {
  console.log("props", props);
});

interface Choice {
  text: string;
  value: string;
  children?: Choice[];
}

const collectionRef = ref("cs_components");
const query = {
  fields: ref(["id", "name", "parent"]),
  limit: ref(-1),
  filter: ref({}),
  page: ref(1),
  search: ref(""),
  sort: ref([]),
};

const getExistingItemsQuery = {
  fields: ref(["*"]),
  page: ref(1),
  limit: ref(-1),
  sort: ref([]),
  search: ref(""),
  filter: computed(() => ({
    id: {
      _in: props.value,
    },
  })),
};

const { useFieldsStore } = useStores();
const fieldsStore = useFieldsStore();
console.log("fieldstore methods", fieldsStore);

const { getItems, items } = useItems(collectionRef, query);
const { getItems: getExistingItems, items: existingItems } = useItems(
  junctionTable,
  getExistingItemsQuery
);
onMounted(async () => {
  await getItems();
  await getExistingItems();
  console.log("existingItems", existingItems);
  value.value = existingItems.value.map((item) => item.cs_components_id);
  console.log("items", items.value);
  choices.value = categorize(items.value);
  loaded.value = true;
});

function categorize(items) {
  const itemMap = new Map();

  // Create a map of parent_id to items
  items.forEach((item) => {
    const parentId = item.parent;
    if (!itemMap.has(parentId)) {
      itemMap.set(parentId, []);
    }
    itemMap.get(parentId).push({
      text: item.name,
      value: item.id,
    });
  });

  function buildTree(parentId = null) {
    const children = itemMap.get(parentId) || [];
    return children.map((child) => {
      const descendants = buildTree(child.value);
      if (descendants.length) {
        child.children = descendants;
      }
      return child;
    });
  }

  // Build the tree starting with parent_id = null
  return buildTree();
}

const newInput = (e) => {
  console.log(e);
  value.value = e;
};
</script>

<style lang="scss" scoped></style>
