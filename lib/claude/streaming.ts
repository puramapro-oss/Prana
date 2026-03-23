import Anthropic from '@anthropic-ai/sdk';
import type { Stream } from '@anthropic-ai/sdk/streaming';
import type { RawMessageStreamEvent } from '@anthropic-ai/sdk/resources';

/**
 * Converts an Anthropic SDK message stream into a web-standard ReadableStream
 * suitable for Next.js streaming responses (e.g. from Route Handlers).
 *
 * Usage:
 *   const stream = await anthropic.messages.create({ ..., stream: true });
 *   return new Response(toReadableStream(stream), {
 *     headers: { 'Content-Type': 'text/event-stream' },
 *   });
 */
export function toReadableStream(
  stream: Stream<RawMessageStreamEvent>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = encoder.encode(event.delta.text);
            controller.enqueue(chunk);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      stream.controller.abort();
    },
  });
}

/**
 * Converts an Anthropic SDK message stream into a ReadableStream that emits
 * Server-Sent Events (SSE). Each SSE contains a JSON payload with the event
 * type and data, giving the client more control over handling.
 *
 * Usage:
 *   const stream = await anthropic.messages.create({ ..., stream: true });
 *   return new Response(toSSEStream(stream), {
 *     headers: { 'Content-Type': 'text/event-stream' },
 *   });
 */
export function toSSEStream(
  stream: Stream<RawMessageStreamEvent>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          const data = JSON.stringify({
            type: event.type,
            ...(event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
              ? { text: event.delta.text }
              : {}),
            ...(event.type === 'message_stop' ? { stop: true } : {}),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      stream.controller.abort();
    },
  });
}
