import React, { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './config/aws-config';
import { nanoid } from 'nanoid';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      // Generate a short ID
      const shortId = nanoid(8); // 8 character unique ID

      // Store the URL mapping in DynamoDB
      await dynamoDb.send(
        new PutCommand({
          TableName: 'url-mappings',
          Item: {
            short_id: shortId,
            long_url: url,
            created_at: new Date().toISOString(),
          },
        })
      );

      // Use the API Gateway URL
      const shortUrlGenerated = `${import.meta.env.VITE_API_GATEWAY_URL}/${shortId}`;
      setShortUrl(shortUrlGenerated);
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <Link2 className="h-12 w-12 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 ml-3">URL Shortener</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Enter your long URL
            </label>
            <input
              type="url"
              id="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Shortening...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {shortUrl && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Your shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-indigo-600 hover:text-indigo-500 break-all"
            >
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;