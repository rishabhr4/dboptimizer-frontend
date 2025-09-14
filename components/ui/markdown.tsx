import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css' // or any other highlight.js theme

interface MarkdownProps {
  children: string
  className?: string
}
export function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for different elements
          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children, ...props }) => {
            const { node, ...rest } = props as any
            const isInline = !node || node.tagName !== 'pre'
            
            if (isInline) {
              return <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...rest}>{children}</code>
            }
            return <code className="block bg-muted p-2 rounded text-sm font-mono overflow-x-auto" {...rest}>{children}</code>
          },
          pre: ({ children }) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic mb-2">{children}</blockquote>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}