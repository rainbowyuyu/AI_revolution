/**
 * Identity of the rendered composition, not of a sentence or changing value.
 * Film may transition only when this key changes. Numeric updates retain a key.
 * Keep branch precedence aligned with TeachingVisual and its child components.
 */
export const visualLayoutKey = (
  scene: string,
  phase = '',
  focus = '',
  unitId = '',
): string => {
  switch (scene) {
    case 'token':
      if (focus === '编号没有距离') return 'token.id-meaning';
      // Distinct example and phase changes get a short explicit handoff; within
      // each phase characters and numeric values retain stable identities.
      if(unitId==='s03-06'||unitId==='s03-07')return 'token.roundtrip-second';
      return `token.rows.${phase||'characters'}`;
    case 'embedding':
      if (phase === 'lookup' && focus === '向量维度') return 'embedding.projection';
      if (phase === 'distance' && focus === '比较方向') return 'embedding.normalize';
      if (!phase || phase === 'lookup') return 'embedding.lookup';
      if (phase === 'position' && /旋转/.test(focus)) return 'embedding.rope';
      if (phase === 'position' && /调换/.test(focus)) return 'embedding.swap';
      if (phase === 'position') return 'embedding.position-add';
      if (phase === 'context') {
        return /颜色|位置|注意力/.test(focus)
          ? 'embedding.relations'
          : 'embedding.context-split';
      }
      return 'embedding.projection';
    case 'attention':
      if(unitId==='s07-04')return 'attention.read-vs-write';
      if(unitId==='s08-06')return 'attention.long-range';
      if(unitId==='s08-05'||unitId==='s08-08')return 'attention.context-stack';
      if(/平滑/.test(focus))return 'attention.query-orbit';
      if (!phase || phase === 'qkv') return 'attention.qkv';
      if (phase === 'scores') {
        return focus === '计算代价' ? 'attention.cost-grid' : 'attention.dot-product';
      }
      if (phase === 'weighted') {
        return focus === '回到图形' ? 'transformer.residual' : 'attention.weighted-sum';
      }
      if (phase === 'multihead') return 'attention.multihead';
      // Mask, scores, weights, and the moving query inhabit one matrix/bar layout.
      return 'attention.matrix-bars';
    case 'transformer':
      if (['residual', 'norm', 'mlp'].includes(phase)) return `transformer.${phase}`;
      return focus === '最后投影' ? 'transformer.vocabulary' : 'transformer.stack';
    case 'next-token':
      if (unitId==='s12-01') return 'next-token.greedy-compare';
      if (unitId==='s12-07') return 'next-token.memory-window';
      if (phase==='temperature') return 'next-token.temperature-dial';
      if (['shift', 'loss', 'evaluation', 'sample'].includes(phase)) return `next-token.${phase}`;
      if (focus === '实验语料') return 'next-token.corpus';
      return focus === '看代码运行' ? 'next-token.code-probabilities' : 'next-token.statistics';
    case 'clip':
      // Crop and letterbox show distinct actual model inputs: transition between them.
      if (phase === 'crop' || phase === 'letterbox') return `clip.input-${phase}`;
      if (phase === 'ranking' || phase === 'failure') return 'clip.evidence-ranking';
      if (phase === 'pairs' || phase === 'contrastive') return 'clip.pair-matrix';
      return 'clip.dual-encoders';
    case 'sft':
      return (!phase || phase === 'examples') ? 'sft.examples' : 'sft.learning';
    case 'preference':
      if (['pairs', 'reward', 'dpo'].includes(phase)) return `preference.${phase}`;
      return 'preference.ppo';
    case 'multimodal': {
      const sound = unitId.startsWith('s19') || /音频|声音|雨声/.test(focus);
      if (sound) {
        return phase === 'evidence' ? 'multimodal.audio-evidence'
          : phase === 'sequence' ? 'multimodal.audio-sequence'
          : 'multimodal.audio-spectrogram';
      }
      if (phase === 'evidence' || phase === 'sequence') return `multimodal.visual-${phase}`;
      // Patches and projector keep the same picture blocks and vector positions.
      return 'multimodal.visual-patches-projector';
    }
    default:
      // Overview precedence intentionally matches TeachingVisual.tsx.
      if (unitId.startsWith('s20') && unitId !== 's20-08') return 'overview.assistant-walkthrough';
      if (/论文/.test(focus)) return 'overview.papers';
      if (focus === '系列地图') return 'overview.series-map';
      if (phase === 'route' || phase === 'pipeline') return 'overview.route';
      if (/空间/.test(focus) || phase === 'bridge') return 'overview.spatial-views';
      if (focus === '颜色干扰') return 'overview.candidates';
      if (focus === '任务照片') return 'overview.photo-closeup';
      if (focus === '从检索到描述') return 'overview.photo-description';
      if (focus === '进入输入') return 'overview.photo-characters';
      return 'overview.photo-relations';
  }
};
