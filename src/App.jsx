import { useState } from "react";

const App = () => {
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/cnnrbrn/html-test-repo"
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
      }

      const data = await response.json();
      console.log(data);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCheckResult = (check) => (
    <div className="mb-4 bg-white rounded-lg shadow p-4" key={check.label}>
      <h5 className="font-semibold text-lg mb-2">{check.label}</h5>
      <p
        className={`text-sm font-medium ${
          check.status === "pass" ? "text-green-600" : "text-red-600"
        }`}
      >
        Status: {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
      </p>
      {check.message && <p className="text-gray-600 mt-1">{check.message}</p>}
      {check.details && (
        <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-600">
          {check.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const Skeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-32 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Code Checker</h1>
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-lg shadow-md p-6"
        >
          <fieldset disabled={loading}>
            <div className="mb-4">
              <label
                htmlFor="repoUrl"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                GitHub Repository URL
              </label>
              <input
                type="text"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://github.com/username/repo"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              disabled={loading}
            >
              {loading ? "Checking..." : "Check Repository"}
            </button>
          </fieldset>
        </form>

        {loading && <Skeleton />}

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-800 text-white">
              <h2 className="text-xl font-bold">Results Summary</h2>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-blue-50 text-black-700 p-4 rounded-lg">
                <p className="font-bold text-lg mb-3">
                  Total files checked: {result.summary.totalFiles}
                </p>
                <p className="text-gray-800 text-lg">
                  Passed:{" "}
                  <span className="text-green-600 font-bold">
                    {result.details.filter((file) => file.passed).length}
                  </span>
                  {" | "}
                  Failed:{" "}
                  <span className="text-red-600 font-bold">
                    {result.details.filter((file) => !file.passed).length}
                  </span>
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Check</th>
                    <th className="px-4 py-2 text-center">Passed</th>
                    <th className="px-4 py-2 text-center">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.summary).map(([key, value]) => {
                    if (key !== "totalFiles") {
                      return (
                        <tr key={key} className="border-b">
                          <td className="px-4 py-2 font-medium">
                            {value.label}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className="text-green-600 font-bold">
                              {value.passed}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className="text-red-600 font-bold">
                              {value.failed}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-800 text-white mt-8">
              <h3 className="text-xl font-bold">Detailed Results</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.details.map((file, index) => (
                <div
                  key={index}
                  className={`rounded-lg shadow-md overflow-hidden ${
                    file.passed ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div
                    className={`p-4 ${
                      file.passed ? "bg-green-500" : "bg-red-500"
                    } text-white`}
                  >
                    <h4 className="font-bold text-lg">{file.fileName}</h4>
                    <p className="text-sm">
                      Overall: {file.passed ? "Passed" : "Failed"}
                    </p>
                  </div>
                  <div className="p-4">
                    {Object.entries(file.checks).map(([, check]) =>
                      renderCheckResult(check)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
