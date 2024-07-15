// Consolidate module data into modules state
export const consolidateModuleData = (modules, modulesMap, moduleData) => {
    const updatedModules = { ...modules };
    moduleData.forEach(module => {
      const slotId = module.slot_id;
      if (modulesMap[slotId]) {
        updatedModules[slotId] = module;
      }
    });
    return updatedModules;
  };
  
  // Get stats for a specific level
  export const getStatsForLevel = (descendantData, level) => {
    if (!descendantData || !descendantData.descendant_stat) return null;
    return descendantData.descendant_stat.find(stat => stat.level === level);
  };
  
  // Modify stat type if necessary
  export const getModifiedStatType = (statType) => {
    const exclusions = {
      'Shield Recovery Out of Combat': 'SROOC',
      'Shield Recovery In Combat': 'SRIC',
    };
    return exclusions[statType] || statType;
  };
  
  // Get last level from module stats
  export const getLastLevel = (module) => module?.module_stat?.slice(-1)[0]?.level || '';
  
  // Get module drain from module stats
  export const getModuleDrain = (module) => module?.module_stat?.slice(-1)[0]?.module_capacity || '';
  