import React, { useState, useEffect } from 'react';
import { fetchAllPatterns, fetchConsumableMaterialMap, fetchAcquisitionInfos } from '../util/api';
import './Patterns.css';

function Patterns() {
  const [rewards, setRewards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const rawRewards = await fetchAllPatterns();
      const metaMap = await fetchConsumableMaterialMap();
      const acquisitionInfos = await fetchAcquisitionInfos();

      const rewardMetaLookup = {};
      for (const entry of Object.values(metaMap)) {
        rewardMetaLookup[entry.pattern_id] = entry;
      }

      const enriched = rawRewards.map(entryReward => {
        const rawId = entryReward.amorphous_reward_id;
        const meta = rewardMetaLookup[rawId];
        const name = meta?.name || rawId;
        const sources = Array.of();
        for (const sourceRaw of meta?.source) {
          const source = acquisitionInfos.find(info => info.acquisition_detail_id === sourceRaw) || "Unknown source";
          sources.push(source.acquisition_detail_name);
        }
        const usage = acquisitionInfos.find(info=>info.acquisition_detail_id.includes(meta.consumable_id))?.acquisition_detail_name || "Unknown usage";
        const open_reward = Array.isArray(entryReward.open_reward)
          ? entryReward.open_reward.map(entry => {
              let stabilizerName = null;
              if (
                entry.required_stabilizer &&
                entry.required_stabilizer.startsWith('Consumable:')
              ) {
                const stabId = entry.required_stabilizer.split(':')[1];
                stabilizerName = metaMap[stabId]?.name || stabId;
              }
              const reward_item = Array.isArray(entry.reward_item)
                ? entry.reward_item.map(item => {
                    const id = item.meta_id;
                    const meta = metaMap[id];
                    return {
                      ...item,
                      meta_name: meta?.name || id,
                      image_url: meta?.imageUrl || null,
                    };
                  })
                : [];
              return {
                ...entry,
                required_stabilizer_name: stabilizerName,
                reward_item,
              };
            })
          : [];
        return {
          ...entryReward,
          name,
          open_reward,
          usage,
          sources,
        };
      });

      setRewards(enriched);
      setFilteredRewards(enriched);
    };
    loadData();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    if (searchTerm.length < 3) {
      setFilteredRewards(rewards);
      return;
    }
    const matches = rewards.map(reward => {
      let matchedTop = false;
      const highlightedFields = {};
      const fullId = reward.amorphous_reward_id;
      const name = reward.name;
      const usage = reward.usage;

      if (
        typeof fullId === 'string' &&
        fullId.toLowerCase().includes(lower)
      ) {
        highlightedFields.highlighted_full_id = highlightMatch(fullId, lower);
        matchedTop = true;
      }
      if (
        typeof name === 'string' &&
        name.toLowerCase().includes(lower)
      ) {
        highlightedFields.highlighted_name = highlightMatch(name, lower);
        matchedTop = true;
      }
      if (
        typeof usage === 'string' &&
        usage.toLowerCase().includes(lower)
      ) {
        highlightedFields.highlighted_usage = highlightMatch(usage, lower);
        matchedTop = true;
      }

      const open_reward = reward.open_reward.map(entry => {
        let entryMatched = false;
        const hEntry = { ...entry };
        if (
          entry.reward_type &&
          entry.reward_type.toLowerCase().includes(lower)
        ) {
          hEntry.highlightedRewardType = highlightMatch(
            entry.reward_type,
            lower
          );
          entryMatched = true;
        }
        if (
          entry.required_stabilizer_name &&
          entry.required_stabilizer_name.toLowerCase().includes(lower)
        ) {
          hEntry.highlightedRequiredStabilizerName = highlightMatch(
            entry.required_stabilizer_name,
            lower
          );
          entryMatched = true;
        }
        const reward_item = entry.reward_item.map(item => {
          let itemMatched = false;
          const hItem = { ...item };
          if (
            item.meta_name &&
            item.meta_name.toLowerCase().includes(lower)
          ) {
            hItem.highlightedMetaName = highlightMatch(item.meta_name, lower);
            itemMatched = true;
          }
          if (
            item.meta_id &&
            item.meta_id.toLowerCase().includes(lower)
          ) {
            hItem.highlightedMetaId = highlightMatch(item.meta_id, lower);
            itemMatched = true;
          }
          if (
            item.meta_type &&
            item.meta_type.toLowerCase().includes(lower)
          ) {
            hItem.highlightedMetaType = highlightMatch(item.meta_type, lower);
            itemMatched = true;
          }
          const rateStr = String(item.rate);
          if (rateStr.includes(lower)) {
            hItem.highlightedRate = highlightMatch(rateStr, lower);
            itemMatched = true;
          }
          return itemMatched ? hItem : item;
        });
        if (
          reward_item.some(it =>
            it.highlightedMetaId ||
            it.highlightedMetaName ||
            it.highlightedMetaType ||
            it.highlightedRate
          )
        ) {
          entryMatched = true;
        }
        return entryMatched
          ? { ...hEntry, reward_item }
          : entry;
      });

      const nestedMatched = open_reward.some(er =>
        er.highlightedRewardType ||
        er.highlightedRequiredStabilizerName ||
        er.reward_item.some(it =>
          it.highlightedMetaId ||
          it.highlightedMetaName ||
          it.highlightedMetaType ||
          it.highlightedRate
        )
      );

      if (matchedTop || nestedMatched) {
        return {
          ...reward,
          ...highlightedFields,
          open_reward,
        };
      }
      return null;
    }).filter(Boolean);
    setFilteredRewards(matches);
  }, [searchTerm, rewards]);

  const highlightMatch = (text, searchLower) => {
    const lowerText = text.toLowerCase();
    const parts = [];
    let idx = 0;
    let pos;
    while ((pos = lowerText.indexOf(searchLower, idx)) > -1) {
      parts.push(text.slice(idx, pos));
      parts.push(
        <span key={parts.length} className="highlight">
          {text.slice(pos, pos + searchLower.length)}
        </span>
      );
      idx = pos + searchLower.length;
    }
    parts.push(text.slice(idx));
    return parts;
  };

  const openModal = reward => {
    setSelectedReward(reward);
  };

  const closeModal = () => {
    setSelectedReward(null);
  };

  return (
    <div className="patterns-container">
      <div className="search-container">
        <h1>Amorphous Pattern Search</h1>
        <input
          type="text"
          className="patternsearch-input"
          placeholder="Search by ID, name, contents, stabilizer..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <p>
          {searchTerm.length < 3
            ? 'Type at least 3 characters to search'
            : `${filteredRewards.length} results found`}
        </p>
      </div>
      <div className="pattern-grid">
        {filteredRewards.map(reward => (
          <div
            key={reward.amorphous_reward_id}
            className="pattern-card"
            onClick={() => openModal(reward)}
          >
            <h2>
              {reward.highlighted_name || reward.name}
            </h2>
            {reward.open_reward
              .filter(entry => !entry.required_stabilizer_name)
              .map((entry, i) => (
                <div key={i} className="reward-entry-box">
                  <div className="reward-entry-header">
                    <strong>Stabilizer:</strong>{' '}
                    {entry.required_stabilizer_name || 'None'}
                  </div>
                  <table className="content-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.reward_item.map((item, idx2) => {
                        const rateValue = parseFloat(item.rate) || 0;
                        const normalizedWidth = (rateValue / 100) * 100;
                        return (
                          <tr key={idx2}>
                            <td>
                              {item.highlightedMetaName || item.meta_name}
                            </td>
                            <td className="chance-column">
                              <div className="bar-container">
                                <div
                                  className="bar"
                                  style={{
                                    width: `${Math.min(normalizedWidth, 100)}%`
                                  }}
                                >
                                  {item.highlightedRate || `${item.rate}%`}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        ))}
      </div>

      {selectedReward && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={closeModal}
            >
              ×
            </button>
            <h2>
              {selectedReward.highlighted_name || selectedReward.name}
            </h2>
            <p>
              <strong>Full ID:</strong>{' '}
              {selectedReward.highlighted_full_id || selectedReward.amorphous_reward_id}
            </p>
            <p>
              <strong>Usage:</strong>{' '}
              {selectedReward.usage || 'N/A'}
            </p>
            <p>
              <details>
                <summary><strong>Sources</strong></summary>
                <ul>
                  {selectedReward.sources.map((source, idx) => (
                    <li key={idx}>{source}</li>
                  ))}
                </ul>
              </details>
            </p>
            
            {selectedReward.open_reward.map((entry, idx) => (
              <div key={idx} className="modal-entry">
                <div className="reward-entry-header">
                  <strong>Stabilizer:</strong>{' '}
                  {entry.highlightedRequiredStabilizerName || entry.required_stabilizer_name || 'None'}
                </div>
                <table className="content-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.reward_item.map((item, j) => {
                      const rateValue = parseFloat(item.rate) || 0;
                      const normalizedWidth = (rateValue / 100) * 100;
                      return (
                        <tr key={j}>
                          <td>
                            {item.highlightedMetaName || item.meta_name}
                          </td>
                          <td className="chance-column">
                            <div className="bar-container">
                              <div
                                className="bar"
                                style={{
                                  width: `${Math.min(normalizedWidth, 100)}%`
                                }}
                              >
                                {item.highlightedRate || `${item.rate}%`}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Patterns;
