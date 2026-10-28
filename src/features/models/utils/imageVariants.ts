// If the first few resized thumbs all fail to load (older uploads weren't
// backfilled by the resize extension), stop requesting them this session.
const thumbStats = { loaded: 0, failed: 0 };

export const thumbsLikelyMissing = () => thumbStats.loaded === 0 && thumbStats.failed >= 4;

export const reportThumbResult = (loaded: boolean) => {
    if (loaded) thumbStats.loaded += 1;
    else thumbStats.failed += 1;
};
