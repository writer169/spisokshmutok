export const CATEGORIES = [
  'Документы и деньги',
  'Одежда',
  'Обувь',
  'Гигиена и косметика',
  'Аптечка',
  'Электроника',
  'Прочее'
];

export const STATUSES = {
  NEED: 'Нужно взять',
  BUY: 'Купить',
  THINK: 'Подумать',
  TAKEN: 'Взял'
};

export const SUBGROUP_COLORS = {
  [STATUSES.NEED]: 'bg-subgroup-default',
  [STATUSES.BUY]: 'bg-subgroup-buy',
  [STATUSES.THINK]: 'bg-subgroup-think',
  [STATUSES.TAKEN]: 'bg-subgroup-taken'
};