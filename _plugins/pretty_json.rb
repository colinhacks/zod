# Ref: https://gist.github.com/mckomo/debe8bb6596276a3d033/

# require 'neatjson'

module Jekyll
  module PrettyJsonFilter

    def pretty_json(input)
      begin
        JSON.pretty_generate(input)
      rescue JSON::GeneratorError => e
        "Error: #{e}."
      end
    end
    def neat_json(input)
      begin
        JSON.neat_generate(input)
      rescue JSON::GeneratorError => e
        "Error: #{e}."
      end
    end

  end
end

Liquid::Template.register_filter(Jekyll::PrettyJsonFilter)

# USAGE:
# {{ site.data.user | pretty_json }}
# {{ site.data.user | neat_json }}
# 
# neatjson formatting options: https://github.com/Phrogz/NeatJSON#options