import { useCallback, useEffect, useState } from "react";
import { getSnapTradeAccounts, getSnapTradePositions } from '../service/snaptradeService'

function SnapTradeAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positionsByAccount, setPositionsByAccount] = useState({});
  const [loadingPositions, setLoadingPositions] = useState({});
  const [positionsErrors, setPositionsErrors] = useState({});

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getSnapTradeAccounts();
      setAccounts(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Could not load brokerage accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPositions = async (accountId) => {
    setLoadingPositions((previous) => ({
      ...previous,
      [accountId]: true,
    }));

    setPositionsErrors((previous) => ({
      ...previous,
      [accountId]: "",
    }));

    try {
      const positions = await getSnapTradePositions(accountId);

      setPositionsByAccount((previous) => ({
        ...previous,
        [accountId]: Array.isArray(positions) ? positions : [],
      }));
    } catch (err) {
      setPositionsErrors((previous) => ({
        ...previous,
        [accountId]: err.message || "Could not load positions.",
      }));
    } finally {
      setLoadingPositions((previous) => ({
        ...previous,
        [accountId]: false,
      }));
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  if (loading) {
    return <p>Loading connected brokerage accounts...</p>;
  }

  return (
    <section>
      <h2>Connected brokerage accounts</h2>

      {error && <p role="alert">{error}</p>}

      {!error && accounts.length === 0 && (
        <p>No brokerage accounts found. Connect a brokerage to get started.</p>
      )}

      {accounts.length > 0 && (
        <ul>
          {accounts.map((account) => (
            <li key={account.id}>
              <strong>{account.name || "Brokerage account"}</strong>
              {" — "}
              {account.number
                ? `Account ending ${String(account.number).slice(-4)}`
                : "Account number unavailable"}
              {account.currency && ` (${account.currency})`}
              <div>
                <button
                  onClick={() => loadPositions(account.id)}
                  disabled={Boolean(loadingPositions[account.id])}
                >
                  {loadingPositions[account.id]
                    ? "Loading positions..."
                    : "View positions"}
                </button>

                {positionsErrors[account.id] && (
                  <p role="alert">{positionsErrors[account.id]}</p>
                )}

                {Object.prototype.hasOwnProperty.call(
                  positionsByAccount,
                  account.id,
                ) && (
                  <div>
                    <h4>Holdings</h4>

                    {positionsByAccount[account.id].length === 0 ? (
                      <p>No positions found in this account.</p>
                    ) : (
                      <ul>
                        {positionsByAccount[account.id].map(
                          (position, index) => (
                            <li key={position.id || position.symbol || index}>
                              <strong>
                                {typeof position.symbol === "string"
                                  ? position.symbol
                                  : position.symbol?.symbol ||
                                    position.symbol?.code ||
                                    position.ticker ||
                                    "Unknown symbol"}
                              </strong>
                              {" — Quantity: "}
                              {position.units ??
                                position.quantity ??
                                "Unavailable"}
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button onClick={loadAccounts} disabled={loading}>
        Refresh accounts
      </button>
    </section>
  );
}

export default SnapTradeAccounts;
